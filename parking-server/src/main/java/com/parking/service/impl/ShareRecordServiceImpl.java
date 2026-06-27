package com.parking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.ShareRecordCreateDTO;
import com.parking.entity.ParkingSpace;
import com.parking.entity.Reservation;
import com.parking.entity.ShareRecord;
import com.parking.mapper.ReservationMapper;
import com.parking.mapper.ShareRecordMapper;
import com.parking.service.ParkingSpaceService;
import com.parking.service.ShareRecordService;
import com.parking.service.UserService;
import com.parking.vo.ShareRecordVO;
import com.parking.vo.ShareStatsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ShareRecordServiceImpl extends ServiceImpl<ShareRecordMapper, ShareRecord> implements ShareRecordService {

    @Autowired
    private ParkingSpaceService parkingSpaceService;

    @Autowired
    private ReservationMapper reservationMapper;

    @Autowired
    private UserService userService;

    @Override
    @Transactional
    public ShareRecord create(ShareRecordCreateDTO createDTO) {
        // 根据停车场ID和车位编号查询车位
        ParkingSpace space = parkingSpaceService.getByLotIdAndSpaceNo(
                createDTO.getLotId(), createDTO.getSpaceNo());
        if (space == null) {
            throw new RuntimeException("车位不存在");
        }
        if (space.getStatus() != 0) {
            throw new RuntimeException("车位当前不可共享");
        }
        // 强制校验车位归属：必须有owner_id且必须等于当前用户
        if (space.getOwnerId() == null) {
            throw new RuntimeException("该车位未绑定业主，无法共享");
        }
        if (!space.getOwnerId().equals(createDTO.getUserId())) {
            throw new RuntimeException("无权共享他人车位");
        }
        if (createDTO.getEndTime().isBefore(createDTO.getStartTime())) {
            throw new RuntimeException("结束时间不能早于开始时间");
        }
        ShareRecord record = new ShareRecord();
        record.setSpaceId(space.getId());
        record.setOwnerId(space.getOwnerId());
        record.setShareType(createDTO.getShareType());
        record.setStartTime(createDTO.getStartTime());
        record.setEndTime(createDTO.getEndTime());
        record.setHourlyPrice(createDTO.getHourlyPrice());
        record.setMonthlyPrice(createDTO.getMonthlyPrice());
        record.setStatus(1);
        baseMapper.insert(record);
        parkingSpaceService.updateLockStatus(space.getId(), 1);
        // 标记车位为已共享
        space.setIsShared(1);
        parkingSpaceService.updateById(space);
        return record;
    }

    @Override
    @Transactional
    public boolean pause(Long id) {
        ShareRecord record = baseMapper.selectById(id);
        if (record == null) {
            throw new RuntimeException("共享记录不存在");
        }
        if (record.getStatus() != 1 && record.getStatus() != 4) {
            throw new RuntimeException("只能暂停共享中或待停止的记录");
        }

        List<Reservation> reservations = reservationMapper.selectList(
                new QueryWrapper<Reservation>()
                        .eq("space_id", record.getSpaceId())
                        .in("status", Arrays.asList(0, 1, 4, 6))
                        .eq("deleted", 0)
        );

        boolean hasUsing = false;
        for (Reservation r : reservations) {
            if (r.getStatus() == 1) {
                hasUsing = true;
            }
        }

        if (hasUsing) {
            // 转为待停止，等待用户离场后自动暂停
            baseMapper.updateStatus(id, 4);
            return true;
        }

        // 取消待使用/待支付的预约并退款
        for (Reservation r : reservations) {
            if (r.getStatus() == 0) {
                userService.addBalance(r.getUserId(), r.getReserveFee());
                reservationMapper.updateCancel(r.getId(), 3, LocalDateTime.now());
                parkingSpaceService.updateStatus(r.getSpaceId(), 0);
            } else if (r.getStatus() == 4) {
                reservationMapper.updateCancel(r.getId(), 3, LocalDateTime.now());
                parkingSpaceService.updateStatus(r.getSpaceId(), 0);
            }
        }

        baseMapper.updateStatus(id, 2);
        parkingSpaceService.updateStatus(record.getSpaceId(), 0);
        parkingSpaceService.updateLockStatus(record.getSpaceId(), 0);
        ParkingSpace space = parkingSpaceService.getById(record.getSpaceId());
        if (space != null) {
            space.setIsShared(0);
            parkingSpaceService.updateById(space);
        }
        return true;
    }

    @Override
    @Transactional
    public boolean resume(Long id) {
        ShareRecord record = baseMapper.selectById(id);
        if (record == null) {
            throw new RuntimeException("共享记录不存在");
        }
        if (record.getStatus() != 2) {
            throw new RuntimeException("只能恢复已暂停的记录");
        }
        baseMapper.updateStatus(id, 1);
        parkingSpaceService.updateLockStatus(record.getSpaceId(), 1);
        ParkingSpace space = parkingSpaceService.getById(record.getSpaceId());
        if (space != null) {
            space.setIsShared(1);
            parkingSpaceService.updateById(space);
        }
        return true;
    }

    @Override
    @Transactional
    public boolean stop(Long id) {
        ShareRecord record = baseMapper.selectById(id);
        if (record == null) {
            throw new RuntimeException("共享记录不存在");
        }
        if (record.getStatus() == 3) {
            throw new RuntimeException("记录已结束");
        }

        List<Reservation> reservations = reservationMapper.selectList(
                new QueryWrapper<Reservation>()
                        .eq("space_id", record.getSpaceId())
                        .in("status", Arrays.asList(0, 1, 4, 6))
                        .eq("deleted", 0)
        );

        boolean hasUsing = false;
        for (Reservation r : reservations) {
            if (r.getStatus() == 1) {
                hasUsing = true;
            }
        }

        if (hasUsing) {
            // 转为待停止，等待用户离场后自动结束
            baseMapper.updateStatus(id, 4);
            return true;
        }

        // 取消待使用/待支付的预约并退款
        for (Reservation r : reservations) {
            if (r.getStatus() == 0) {
                userService.addBalance(r.getUserId(), r.getReserveFee());
                reservationMapper.updateCancel(r.getId(), 3, LocalDateTime.now());
                parkingSpaceService.updateStatus(r.getSpaceId(), 0);
            } else if (r.getStatus() == 4) {
                reservationMapper.updateCancel(r.getId(), 3, LocalDateTime.now());
                parkingSpaceService.updateStatus(r.getSpaceId(), 0);
            }
        }

        baseMapper.updateStatus(id, 3);
        parkingSpaceService.updateStatus(record.getSpaceId(), 0);
        parkingSpaceService.updateLockStatus(record.getSpaceId(), 0);
        ParkingSpace space = parkingSpaceService.getById(record.getSpaceId());
        if (space != null) {
            space.setIsShared(0);
            parkingSpaceService.updateById(space);
        }
        return true;
    }

    @Override
    public ShareStatsVO getStats(Long ownerId) {
        ShareStatsVO stats = new ShareStatsVO();
        if (ownerId == null) {
            return stats;
        }
        int total = baseMapper.countByOwnerId(ownerId);
        int active = baseMapper.countActiveByOwnerId(ownerId);
        stats.setTotalSharedCount(total);
        stats.setActiveCount(active);
        // 收益统计先简化处理，后续可根据 share_bill 表计算
        stats.setTotalEarnings(BigDecimal.ZERO);
        stats.setThisMonthEarnings(BigDecimal.ZERO);
        stats.setTotalSharedHours(0);
        return stats;
    }

    @Override
    public List<ShareRecordVO> listVO(Long ownerId, String status, Integer pageNum, Integer pageSize) {
        if (ownerId == null) {
            return new ArrayList<>();
        }
        int offset = (pageNum - 1) * pageSize;
        List<ShareRecordVO> list = baseMapper.selectVOList(ownerId, status, offset, pageSize);
        for (ShareRecordVO vo : list) {
            vo.setStatusText(getStatusText(vo.getStatus()));
        }
        return list;
    }

    private String getStatusText(Integer status) {
        if (status == null) return "未知";
        switch (status) {
            case 0: return "待审核";
            case 1: return "共享中";
            case 2: return "已暂停";
            case 3: return "已结束";
            case 4: return "待停止";
            default: return "未知";
        }
    }

    @Override
    public List<ShareRecord> listByOwnerId(Long ownerId) {
        return baseMapper.selectByOwnerId(ownerId);
    }

    @Override
    public List<ShareRecord> selectActiveBySpaceId(Long spaceId) {
        return baseMapper.selectActiveBySpaceId(spaceId);
    }

    @Override
    public ShareRecord selectPendingStopBySpaceId(Long spaceId) {
        return baseMapper.selectPendingStopBySpaceId(spaceId);
    }

    @Override
    @Transactional
    public void autoExpire() {
        LocalDateTime now = LocalDateTime.now();
        List<ShareRecord> expiredList = baseMapper.selectExpired(now);
        for (ShareRecord record : expiredList) {
            baseMapper.updateStatus(record.getId(), 3);
            ParkingSpace space = parkingSpaceService.getById(record.getSpaceId());
            if (space != null) {
                space.setStatus(0);
                space.setLockStatus(0);
                space.setIsShared(0);
                parkingSpaceService.updateById(space);
            }
        }
    }

    @Override
    @Transactional
    public void tryCompletePendingStop(Long spaceId) {
        ShareRecord record = baseMapper.selectPendingStopBySpaceId(spaceId);
        if (record == null) {
            return;
        }
        int blockingCount = reservationMapper.countBlockingReservationBySpaceId(spaceId);
        if (blockingCount > 0) {
            return;
        }
        // 无阻塞预约，自动完成结束/暂停
        int targetStatus = record.getStatus() == 4 ? 3 : 3; // 待停止统一转为已结束
        baseMapper.updateStatus(record.getId(), targetStatus);
        parkingSpaceService.updateStatus(spaceId, 0);
        parkingSpaceService.updateLockStatus(spaceId, 0);
        ParkingSpace space = parkingSpaceService.getById(spaceId);
        if (space != null) {
            space.setIsShared(0);
            parkingSpaceService.updateById(space);
        }
    }
}
