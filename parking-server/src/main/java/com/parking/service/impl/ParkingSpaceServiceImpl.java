package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.entity.ParkingSpace;
import com.parking.entity.ShareRecord;
import com.parking.mapper.ParkingSpaceMapper;
import com.parking.mapper.ShareRecordMapper;
import com.parking.service.ParkingSpaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkingSpaceServiceImpl extends ServiceImpl<ParkingSpaceMapper, ParkingSpace> implements ParkingSpaceService {

    @Autowired
    private ShareRecordMapper shareRecordMapper;

    @Override
    public List<ParkingSpace> listByLotId(Long lotId) {
        List<ParkingSpace> list = baseMapper.selectByLotId(lotId);
        fillShareInfo(list);
        return list;
    }

    @Override
    public List<ParkingSpace> listAvailableByLotId(Long lotId) {
        List<ParkingSpace> list = baseMapper.selectByLotIdAndStatus(lotId, 0);
        fillShareInfo(list);
        return list;
    }

    @Override
    public boolean updateStatus(Long id, Integer status) {
        return baseMapper.updateStatus(id, status) > 0;
    }

    @Override
    public boolean updateLockStatus(Long id, Integer lockStatus) {
        return baseMapper.updateLockStatus(id, lockStatus) > 0;
    }

    @Override
    public ParkingSpace getByLotIdAndSpaceNo(Long lotId, String spaceNo) {
        ParkingSpace space = baseMapper.selectByLotIdAndSpaceNo(lotId, spaceNo);
        if (space != null) {
            fillShareInfo(java.util.Collections.singletonList(space));
        }
        return space;
    }

    @Override
    public List<ParkingSpace> listByOwnerId(Long ownerId) {
        List<ParkingSpace> list = baseMapper.selectByOwnerId(ownerId);
        fillShareInfo(list);
        return list;
    }

    private void fillShareInfo(List<ParkingSpace> list) {
        if (list == null || list.isEmpty()) {
            return;
        }
        for (ParkingSpace space : list) {
            if (space.getIsShared() != null && space.getIsShared() == 1) {
                List<ShareRecord> records = shareRecordMapper.selectActiveBySpaceId(space.getId());
                if (!records.isEmpty()) {
                    space.setShareHourlyPrice(records.get(0).getHourlyPrice());
                }
            }
        }
    }
}
