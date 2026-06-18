package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.entity.ParkingLot;
import com.parking.mapper.ParkingLotMapper;
import com.parking.service.ParkingLotService;
import org.springframework.stereotype.Service;

@Service
public class ParkingLotServiceImpl extends ServiceImpl<ParkingLotMapper, ParkingLot> implements ParkingLotService {
}
