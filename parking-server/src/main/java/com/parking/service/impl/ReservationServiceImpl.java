package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.ReservationCreateDTO;
import com.parking.dto.ShareBillCreateDTO;
import com.parking.entity.ParkingLot;
import com.parking.entity.ParkingRecord;
import com.parking.entity.ParkingSpace;
import com.parking.entity.Reservation;
import com.parking.entity.ShareRecord;
import com.parking.mapper.ParkingRecordMapper;
import com.parking.mapper.ReservationMapper;
import com.parking.service.ParkingLotService;
import com.parking.service.ParkingSpaceService;
import com.parking.service.ReservationService;
import com.parking.service.ShareBillService;
import com.parking.service.ShareRecordService;
import com.parking.vo.ReservationVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
public class ReservationServiceImpl extends ServiceImpl<ReservationMapper, Reservation> implements ReservationService {

    @Autowired
    private ParkingSpaceService parkingSpaceService;

    @Autowired
    private ParkingLotService parkingLotService;

    @Autowired
    private ParkingRecordMapper parkingRecordMapper;

    @Autowired
    private ShareRecordService shareRecordService;

    @Autowired
    private ShareBillService shareBillService;

    @Override
    @Transactional
    public Reservation create(ReservationCreateDTO createDTO) {
        // 检查用户是否有待支付的预约（防止重复创建订单）
        Reservation existingUnpaid = baseMapper.selectUnpaidByUserId(createDTO.getUserId());
        if (existingUnpaid != null) {
            // 有待支付的预约，直接返回已有订单
            return existingUnpaid;
        }

        ParkingSpace space = parkingSpaceService.getById(createDTO.getSpaceId());
        if (space == null) {
            throw new RuntimeException("车位不存在");
        }
        if (space.getStatus() != 0) {
            throw new RuntimeException("车位已被占用或预约");
        }
        boolean isOwnerSelfUse = space.getOwnerId() != null
                && (space.getIsShared() == null || space.getIsShared() != 1)
                && space.getOwnerId().equals(createDTO.getUserId());

        if (space.getOwnerId() != null && !isOwnerSelfUse) {
            // 私人车位（未共享）：非业主不可预约
            if (space.getIsShared() == null || space.getIsShared() != 1) {
                throw new RuntimeException("该车位为私人车位，不可预约");
            }
            // 共享车位：业主本人不可预约
            if (space.getOwnerId().equals(createDTO.getUserId())) {
                throw new RuntimeException("共享车位不可由业主本人预约");
            }
        }
        // 检查车位是否处于待停止状态
        if (space.getIsShared() != null && space.getIsShared() == 1) {
            ShareRecord pendingStop = shareRecordService.selectPendingStopBySpaceId(space.getId());
            if (pendingStop != null) {
                throw new RuntimeException("该共享车位即将停止，不接受新预约");
            }
        }
        if (createDTO.getEndTime().isBefore(createDTO.getStartTime())) {
            throw new RuntimeException("结束时间不能早于开始时间");
        }
        long hours = ChronoUnit.HOURS.between(createDTO.getStartTime(), createDTO.getEndTime());
        if (hours < 1) hours = 1;
        // 预约费：每小时2元（业主自用私人车位免费）
        BigDecimal reserveFee = isOwnerSelfUse ? BigDecimal.ZERO
                : new BigDecimal("2.00").multiply(new BigDecimal(hours));
        Reservation reservation = new Reservation();
        reservation.setUserId(createDTO.getUserId());
        reservation.setLotId(createDTO.getLotId());
        reservation.setSpaceId(createDTO.getSpaceId());
        reservation.setPlateNumber(createDTO.getPlateNumber());
        reservation.setStartTime(createDTO.getStartTime());
        reservation.setEndTime(createDTO.getEndTime());
        reservation.setReserveFee(reserveFee);
        reservation.setStatus(isOwnerSelfUse ? 0 : 4);  // 业主自用直接待使用，其他待支付
        baseMapper.insert(reservation);
        // 创建预约时立即锁定车位（状态2-已预约）
        parkingSpaceService.updateStatus(createDTO.getSpaceId(), 2);
        return reservation;
    }

    @Override
    @Transactional
    public boolean cancel(Long id) {
        Reservation reservation = baseMapper.selectById(id);
        if (reservation == null) {
            throw new RuntimeException("预约不存在");
        }
        // 待支付(4)、待使用(0)、使用中(1) 都可以取消
        if (reservation.getStatus() != 0 && reservation.getStatus() != 1 && reservation.getStatus() != 4) {
            throw new RuntimeException("只能取消待支付、待使用或使用中的预约");
        }
        baseMapper.updateCancel(id, 3, LocalDateTime.now());  // 状态3：已取消
        // 释放车位（待支付、待使用、使用中状态都需要释放）
        parkingSpaceService.updateStatus(reservation.getSpaceId(), 0);
        // 尝试自动完成待停止的共享记录
        shareRecordService.tryCompletePendingStop(reservation.getSpaceId());
        return true;
    }

    @Override
    @Transactional
    public boolean entry(Long id) {
        Reservation reservation = baseMapper.selectById(id);
        if (reservation == null) {
            throw new RuntimeException("预约不存在");
        }
        if (reservation.getStatus() != 0) {
            throw new RuntimeException("只有待使用的预约可以入场");
        }
        baseMapper.updateEntry(id, 1, LocalDateTime.now());
        parkingSpaceService.updateStatus(reservation.getSpaceId(), 1);

        // 同步创建停车记录
        ParkingRecord record = new ParkingRecord();
        record.setUserId(reservation.getUserId());
        record.setLotId(reservation.getLotId());
        record.setSpaceId(reservation.getSpaceId());
        record.setPlateNumber(reservation.getPlateNumber());
        record.setEntryTime(LocalDateTime.now());
        record.setPayStatus(0);
        record.setRecordStatus(0);
        parkingRecordMapper.insert(record);

        return true;
    }

    @Override
    @Transactional
    public BigDecimal exit(Long id) {
        Reservation reservation = baseMapper.selectById(id);
        if (reservation == null) {
            throw new RuntimeException("预约不存在");
        }
        if (reservation.getStatus() != 1) {
            throw new RuntimeException("只有使用中的预约可以离场");
        }
        if (reservation.getEntryTime() == null) {
            throw new RuntimeException("未记录入场时间");
        }

        LocalDateTime exitTime = LocalDateTime.now();

        // 计算实际停车时长（分钟）
        long minutes = ChronoUnit.MINUTES.between(reservation.getEntryTime(), exitTime);
        if (minutes < 1) minutes = 1;

        // 获取停车场收费标准
        ParkingLot parkingLot = parkingLotService.getById(reservation.getLotId());
        ParkingSpace space = parkingSpaceService.getById(reservation.getSpaceId());

        BigDecimal hourlyRate;
        int freeMinutes;
        if (space != null && space.getIsShared() != null && space.getIsShared() == 1) {
            // 共享车位：按业主设置的共享单价计费
            List<ShareRecord> shareRecords = shareRecordService.selectActiveBySpaceId(space.getId());
            if (!shareRecords.isEmpty()) {
                hourlyRate = shareRecords.get(0).getHourlyPrice();
            } else {
                hourlyRate = parkingLot != null && parkingLot.getHourlyRate() != null
                    ? parkingLot.getHourlyRate()
                    : new BigDecimal("8.00");
            }
            freeMinutes = parkingLot != null && parkingLot.getFreeMinutes() != null
                ? parkingLot.getFreeMinutes()
                : 15;
        } else {
            hourlyRate = parkingLot != null && parkingLot.getHourlyRate() != null
                ? parkingLot.getHourlyRate()
                : new BigDecimal("8.00");  // 默认每小时8元
            freeMinutes = parkingLot != null && parkingLot.getFreeMinutes() != null
                ? parkingLot.getFreeMinutes()
                : 15;  // 默认15分钟免费
        }

        // 计算停车费：扣除免费时长后按小时计费
        BigDecimal parkingFee = BigDecimal.ZERO;

        boolean isOwnerSelfUseExit = space != null && space.getOwnerId() != null
                && (space.getIsShared() == null || space.getIsShared() != 1)
                && space.getOwnerId().equals(reservation.getUserId());

        if (!isOwnerSelfUseExit) {
            long billableMinutes = minutes - freeMinutes;
            if (billableMinutes > 0) {
                // 超过免费时长，按小时计费（不足1小时按1小时算）
                int billableHours = (int) Math.ceil(billableMinutes / 60.0);
                parkingFee = hourlyRate.multiply(new BigDecimal(billableHours)).setScale(2, RoundingMode.HALF_UP);
            }
        }
        // 15分钟内免费，停车费为0；业主自用私人车位也免费

        // 更新预约：记录离场时间、停车费
        reservation.setExitTime(exitTime);
        reservation.setParkingFee(parkingFee);
        if (parkingFee.compareTo(BigDecimal.ZERO) > 0) {
            // 有待支付停车费，状态设为待支付停车费(6)
            reservation.setStatus(6);
        } else {
            // 免费停车，直接完成
            reservation.setStatus(2);
        }
        baseMapper.updateById(reservation);

        // 同步更新停车记录
        ParkingRecord record = parkingRecordMapper.selectOngoingBySpaceId(reservation.getSpaceId());
        if (record != null) {
            record.setExitTime(exitTime);
            record.setDurationMinutes((int) minutes);
            record.setFee(parkingFee);
            record.setRecordStatus(1);
            parkingRecordMapper.updateById(record);
        }

        // 释放车位
        parkingSpaceService.updateStatus(reservation.getSpaceId(), 0);

        // 若该车位为共享车位，自动生成共享账单（收益归业主）
        if (space != null && space.getIsShared() != null && space.getIsShared() == 1 && space.getOwnerId() != null) {
            List<ShareRecord> shareRecords = shareRecordService.selectActiveBySpaceId(space.getId());
            if (!shareRecords.isEmpty()) {
                ShareRecord sr = shareRecords.get(0);
                ShareBillCreateDTO billDTO = new ShareBillCreateDTO();
                billDTO.setShareRecordId(sr.getId());
                billDTO.setRenterId(reservation.getUserId());
                billDTO.setStartTime(reservation.getEntryTime());
                billDTO.setEndTime(exitTime);
                shareBillService.createBill(billDTO);
            }
        }

        // 尝试自动完成待停止的共享记录
        shareRecordService.tryCompletePendingStop(reservation.getSpaceId());

        return parkingFee;
    }

    @Override
    @Transactional
    public boolean markParkingPaid(Long id) {
        Reservation reservation = baseMapper.selectById(id);
        if (reservation == null) {
            throw new RuntimeException("预约不存在");
        }
        if (reservation.getStatus() != 2) {
            throw new RuntimeException("预约状态异常，无法支付停车费");
        }
        // 标记停车费已支付，状态变为已完成(2)保持不变，但可以记录支付状态
        // 这里可以增加一个支付状态字段，暂时用状态表示
        return true;
    }

    @Override
    @Transactional
    public boolean markPaid(Long id) {
        Reservation reservation = baseMapper.selectById(id);
        if (reservation == null) {
            throw new RuntimeException("预约不存在");
        }
        if (reservation.getStatus() != 4) {
            throw new RuntimeException("预约状态异常，无法支付");
        }
        // 支付成功后：状态变为待使用(0)，车位已经在创建时锁定，无需再次锁定
        baseMapper.updateStatus(id, 0);
        return true;
    }

    @Override
    public List<ReservationVO> listVOByUserId(Long userId) {
        List<ReservationVO> list = baseMapper.selectVOByUserId(userId);
        fillOwnerSelfUse(list);
        return list;
    }

    @Override
    public List<ReservationVO> listVOByUserIdAndStatus(Long userId, List<Integer> statusList) {
        List<ReservationVO> list = baseMapper.selectVOByUserIdAndStatus(userId, statusList);
        fillOwnerSelfUse(list);
        return list;
    }

    private void fillOwnerSelfUse(List<ReservationVO> list) {
        if (list == null || list.isEmpty()) {
            return;
        }
        List<Long> spaceIds = list.stream()
                .map(ReservationVO::getSpaceId)
                .distinct()
                .collect(Collectors.toList());
        List<ParkingSpace> spaces = parkingSpaceService.listByIds(spaceIds);
        Map<Long, ParkingSpace> spaceMap = spaces.stream()
                .collect(Collectors.toMap(ParkingSpace::getId, s -> s));
        for (ReservationVO vo : list) {
            ParkingSpace space = spaceMap.get(vo.getSpaceId());
            boolean isOwnerSelfUse = space != null && space.getOwnerId() != null
                    && (space.getIsShared() == null || space.getIsShared() != 1)
                    && space.getOwnerId().equals(vo.getUserId());
            vo.setIsOwnerSelfUse(isOwnerSelfUse);
        }
    }

    @Override
    public ReservationVO getVOById(Long id) {
        return baseMapper.selectVOById(id);
    }

    @Override
    @Transactional
    public void releaseExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();
        
        // 1. 预约结束时间已过，释放车位
        List<Reservation> endExpiredList = baseMapper.selectExpired(now);
        for (Reservation r : endExpiredList) {
            baseMapper.updateStatus(r.getId(), 5);  // 状态5：已过期
            parkingSpaceService.updateStatus(r.getSpaceId(), 0);
            shareRecordService.tryCompletePendingStop(r.getSpaceId());
        }
        
        // 2. 预约开始时间已过15分钟但未入场，释放车位（防止占位不进场）
        LocalDateTime startExpireTime = now.minusMinutes(15);
        List<Reservation> startExpiredList = baseMapper.selectStartExpired(startExpireTime);
        for (Reservation r : startExpiredList) {
            baseMapper.updateStatus(r.getId(), 5);  // 状态5：已过期
            parkingSpaceService.updateStatus(r.getSpaceId(), 0);
            shareRecordService.tryCompletePendingStop(r.getSpaceId());
        }
    }

    @Override
    @Transactional
    public void cancelUnpaidExpired() {
        // 1分钟未支付的预约自动取消（方便测试）
        LocalDateTime expireTime = LocalDateTime.now().minusMinutes(1);
        List<Reservation> unpaidExpiredList = baseMapper.selectUnpaidExpired(expireTime);
        for (Reservation r : unpaidExpiredList) {
            baseMapper.updateCancel(r.getId(), 3, LocalDateTime.now());  // 状态3：已取消
            // 释放车位（创建预约时已锁定）
            parkingSpaceService.updateStatus(r.getSpaceId(), 0);
            shareRecordService.tryCompletePendingStop(r.getSpaceId());
        }
    }
}
