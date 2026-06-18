package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.EntryDTO;
import com.parking.dto.ExitDTO;
import com.parking.entity.ParkingRecord;

import java.math.BigDecimal;
import java.util.List;

public interface ParkingRecordService extends IService<ParkingRecord> {

    ParkingRecord entry(EntryDTO entryDTO);

    ParkingRecord exit(ExitDTO exitDTO);

    List<ParkingRecord> listByUserId(Long userId);

    BigDecimal calculateFee(Long lotId, Integer durationMinutes);
}
