package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.entity.ParkingLot;

public interface ParkingLotService extends IService<ParkingLot> {

    /**
     * 根据ID获取停车场详情，并实时统计车位数据
     */
    ParkingLot getDetailWithStats(Long id);
}
