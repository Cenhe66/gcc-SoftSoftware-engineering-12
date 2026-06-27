package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.EntryDTO;
import com.parking.dto.ExitDTO;
import com.parking.entity.ParkingRecord;
import com.parking.vo.ParkingRecordVO;

import com.baomidou.mybatisplus.core.metadata.IPage;

import java.math.BigDecimal;
import java.util.List;

public interface ParkingRecordService extends IService<ParkingRecord> {

    ParkingRecord entry(EntryDTO entryDTO);

    ParkingRecord exit(ExitDTO exitDTO);

    List<ParkingRecord> listByUserId(Long userId);

    /**
     * 查询用户停车记录列表（包含关联信息）
     */
    List<ParkingRecordVO> listVOByUserId(Long userId);

    /**
     * 管理员分页查询全部停车记录（包含关联信息）
     */
    IPage<ParkingRecordVO> listVOPage(IPage<ParkingRecordVO> page, String plateNumber, Integer recordStatus, String entryStart, String entryEnd);

    BigDecimal calculateFee(Long lotId, Integer durationMinutes);
}
