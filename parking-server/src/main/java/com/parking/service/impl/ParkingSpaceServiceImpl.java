package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.entity.ParkingSpace;
import com.parking.mapper.ParkingSpaceMapper;
import com.parking.service.ParkingSpaceService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ParkingSpaceServiceImpl extends ServiceImpl<ParkingSpaceMapper, ParkingSpace> implements ParkingSpaceService {

    @Override
    public List<ParkingSpace> listByLotId(Long lotId) {
        return baseMapper.selectByLotId(lotId);
    }

    @Override
    public List<ParkingSpace> listAvailableByLotId(Long lotId) {
        return baseMapper.selectByLotIdAndStatus(lotId, 0);
    }

    @Override
    public boolean updateStatus(Long id, Integer status) {
        return baseMapper.updateStatus(id, status) > 0;
    }

    @Override
    public boolean updateLockStatus(Long id, Integer lockStatus) {
        return baseMapper.updateLockStatus(id, lockStatus) > 0;
    }
}
