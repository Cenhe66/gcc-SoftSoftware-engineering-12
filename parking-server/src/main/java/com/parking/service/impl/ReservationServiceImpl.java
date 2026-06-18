package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.ReservationCreateDTO;
import com.parking.entity.ParkingSpace;
import com.parking.entity.Reservation;
import com.parking.mapper.ReservationMapper;
import com.parking.service.ParkingSpaceService;
import com.parking.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ReservationServiceImpl extends ServiceImpl<ReservationMapper, Reservation> implements ReservationService {

    @Autowired
    private ParkingSpaceService parkingSpaceService;

    @Override
    @Transactional
    public Reservation create(ReservationCreateDTO createDTO) {
        ParkingSpace space = parkingSpaceService.getById(createDTO.getSpaceId());
        if (space == null) {
            throw new RuntimeException("车位不存在");
        }
        if (space.getStatus() != 0) {
            throw new RuntimeException("车位已被占用或预约");
        }
        if (createDTO.getEndTime().isBefore(createDTO.getStartTime())) {
            throw new RuntimeException("结束时间不能早于开始时间");
        }
        long hours = ChronoUnit.HOURS.between(createDTO.getStartTime(), createDTO.getEndTime());
        if (hours < 1) hours = 1;
        BigDecimal reserveFee = new BigDecimal("2.00").multiply(new BigDecimal(hours));
        Reservation reservation = new Reservation();
        reservation.setUserId(createDTO.getUserId());
        reservation.setLotId(createDTO.getLotId());
        reservation.setSpaceId(createDTO.getSpaceId());
        reservation.setPlateNumber(createDTO.getPlateNumber());
        reservation.setStartTime(createDTO.getStartTime());
        reservation.setEndTime(createDTO.getEndTime());
        reservation.setReserveFee(reserveFee);
        reservation.setStatus(0);
        baseMapper.insert(reservation);
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
        if (reservation.getStatus() != 0) {
            throw new RuntimeException("只能取消待使用的预约");
        }
        baseMapper.updateCancel(id, 2, LocalDateTime.now());
        parkingSpaceService.updateStatus(reservation.getSpaceId(), 0);
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
            throw new RuntimeException("预约状态异常");
        }
        baseMapper.updateEntry(id, 1, LocalDateTime.now());
        parkingSpaceService.updateStatus(reservation.getSpaceId(), 1);
        return true;
    }

    @Override
    public List<Reservation> listByUserId(Long userId) {
        return baseMapper.selectByUserId(userId);
    }

    @Override
    @Transactional
    public void releaseExpiredReservations() {
        List<Reservation> expiredList = baseMapper.selectExpired(LocalDateTime.now());
        for (Reservation r : expiredList) {
            baseMapper.updateStatus(r.getId(), 3);
            parkingSpaceService.updateStatus(r.getSpaceId(), 0);
        }
    }
}
