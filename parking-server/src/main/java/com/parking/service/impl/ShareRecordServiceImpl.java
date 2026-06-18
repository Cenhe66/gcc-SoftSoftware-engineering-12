package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.ShareRecordCreateDTO;
import com.parking.entity.ParkingSpace;
import com.parking.entity.ShareRecord;
import com.parking.mapper.ShareRecordMapper;
import com.parking.service.ParkingSpaceService;
import com.parking.service.ShareRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ShareRecordServiceImpl extends ServiceImpl<ShareRecordMapper, ShareRecord> implements ShareRecordService {

    @Autowired
    private ParkingSpaceService parkingSpaceService;

    @Override
    @Transactional
    public ShareRecord create(ShareRecordCreateDTO createDTO) {
        ParkingSpace space = parkingSpaceService.getById(createDTO.getSpaceId());
        if (space == null) {
            throw new RuntimeException("车位不存在");
        }
        if (space.getStatus() != 0) {
            throw new RuntimeException("车位当前不可共享");
        }
        if (createDTO.getEndTime().isBefore(createDTO.getStartTime())) {
            throw new RuntimeException("结束时间不能早于开始时间");
        }
        ShareRecord record = new ShareRecord();
        record.setSpaceId(createDTO.getSpaceId());
        record.setOwnerId(createDTO.getOwnerId());
        record.setShareType(createDTO.getShareType());
        record.setStartTime(createDTO.getStartTime());
        record.setEndTime(createDTO.getEndTime());
        record.setHourlyPrice(createDTO.getHourlyPrice());
        record.setMonthlyPrice(createDTO.getMonthlyPrice());
        record.setStatus(1);
        baseMapper.insert(record);
        parkingSpaceService.updateStatus(createDTO.getSpaceId(), 3);
        parkingSpaceService.updateLockStatus(createDTO.getSpaceId(), 1);
        return record;
    }

    @Override
    @Transactional
    public boolean pause(Long id) {
        ShareRecord record = baseMapper.selectById(id);
        if (record == null) {
            throw new RuntimeException("共享记录不存在");
        }
        if (record.getStatus() != 1) {
            throw new RuntimeException("只能暂停共享中的记录");
        }
        baseMapper.updateStatus(id, 2);
        parkingSpaceService.updateStatus(record.getSpaceId(), 0);
        parkingSpaceService.updateLockStatus(record.getSpaceId(), 0);
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
        parkingSpaceService.updateStatus(record.getSpaceId(), 3);
        parkingSpaceService.updateLockStatus(record.getSpaceId(), 1);
        return true;
    }

    @Override
    public List<ShareRecord> listByOwnerId(Long ownerId) {
        return baseMapper.selectByOwnerId(ownerId);
    }
}
