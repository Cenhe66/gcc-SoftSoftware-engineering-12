package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.EntryDTO;
import com.parking.dto.ExitDTO;
import com.parking.entity.ParkingLot;
import com.parking.entity.ParkingRecord;
import com.parking.entity.ParkingSpace;
import com.parking.mapper.ParkingRecordMapper;
import com.parking.service.ParkingLotService;
import com.parking.service.ParkingRecordService;
import com.parking.service.ParkingSpaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ParkingRecordServiceImpl extends ServiceImpl<ParkingRecordMapper, ParkingRecord> implements ParkingRecordService {

    @Autowired
    private ParkingLotService parkingLotService;

    @Autowired
    private ParkingSpaceService parkingSpaceService;

    @Override
    @Transactional
    public ParkingRecord entry(EntryDTO entryDTO) {
        ParkingRecord record = new ParkingRecord();
        record.setUserId(entryDTO.getUserId());
        record.setLotId(entryDTO.getLotId());
        record.setSpaceId(entryDTO.getSpaceId());
        record.setPlateNumber(entryDTO.getPlateNumber());
        record.setEntryTime(LocalDateTime.now());
        record.setPayStatus(0);
        record.setRecordStatus(0);
        baseMapper.insert(record);

        if (entryDTO.getSpaceId() != null) {
            parkingSpaceService.updateStatus(entryDTO.getSpaceId(), 1);
        }

        return record;
    }

    @Override
    @Transactional
    public ParkingRecord exit(ExitDTO exitDTO) {
        ParkingRecord record = baseMapper.selectOngoingByPlate(exitDTO.getPlateNumber());
        if (record == null) {
            throw new RuntimeException("未找到进行中的停车记录");
        }

        LocalDateTime exitTime = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(record.getEntryTime(), exitTime);
        int durationMinutes = (int) Math.max(minutes, 1);

        BigDecimal fee = calculateFee(record.getLotId(), durationMinutes);

        baseMapper.updateOnExit(record.getId(), exitTime, durationMinutes, fee);

        record.setExitTime(exitTime);
        record.setDurationMinutes(durationMinutes);
        record.setFee(fee);
        record.setRecordStatus(1);

        if (record.getSpaceId() != null) {
            parkingSpaceService.updateStatus(record.getSpaceId(), 0);
        }

        return record;
    }

    @Override
    public List<ParkingRecord> listByUserId(Long userId) {
        return baseMapper.selectByUserId(userId);
    }

    @Override
    public BigDecimal calculateFee(Long lotId, Integer durationMinutes) {
        ParkingLot lot = parkingLotService.getById(lotId);
        if (lot == null) {
            return BigDecimal.ZERO;
        }

        if (durationMinutes <= lot.getFreeMinutes()) {
            return BigDecimal.ZERO;
        }

        int chargeMinutes = durationMinutes - lot.getFreeMinutes();
        int hours = (int) Math.ceil(chargeMinutes / 60.0);
        BigDecimal fee = lot.getHourlyRate().multiply(new BigDecimal(hours));

        if (lot.getDailyCap() != null && fee.compareTo(lot.getDailyCap()) > 0) {
            fee = lot.getDailyCap();
        }

        return fee;
    }
}
