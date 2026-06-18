package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.entity.ParkingSpace;

import java.util.List;

public interface ParkingSpaceService extends IService<ParkingSpace> {

    List<ParkingSpace> listByLotId(Long lotId);

    List<ParkingSpace> listAvailableByLotId(Long lotId);

    boolean updateStatus(Long id, Integer status);

    boolean updateLockStatus(Long id, Integer lockStatus);
}
