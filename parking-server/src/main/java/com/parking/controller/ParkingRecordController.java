package com.parking.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.parking.dto.EntryDTO;
import com.parking.dto.ExitDTO;
import com.parking.entity.ParkingRecord;
import com.parking.service.ParkingRecordService;
import com.parking.vo.Result;
import com.parking.vo.ParkingRecordVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking-record")
public class ParkingRecordController {

    @Autowired
    private ParkingRecordService parkingRecordService;

    @PostMapping("/entry")
    public Result<ParkingRecord> entry(@RequestBody @Validated EntryDTO entryDTO) {
        ParkingRecord record = parkingRecordService.entry(entryDTO);
        return Result.success(record);
    }

    @PostMapping("/exit")
    public Result<ParkingRecord> exit(@RequestBody @Validated ExitDTO exitDTO) {
        ParkingRecord record = parkingRecordService.exit(exitDTO);
        return Result.success(record);
    }

    @GetMapping("/list/{userId}")
    public Result<List<ParkingRecordVO>> listByUserId(@PathVariable Long userId) {
        List<ParkingRecordVO> list = parkingRecordService.listVOByUserId(userId);
        return Result.success(list);
    }

    @GetMapping("/admin/list")
    public Result<IPage<ParkingRecordVO>> adminList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String plateNumber,
            @RequestParam(required = false) Integer recordStatus,
            @RequestParam(required = false) String entryStart,
            @RequestParam(required = false) String entryEnd) {
        Page<ParkingRecordVO> pageParam = new Page<>(page, size);
        IPage<ParkingRecordVO> result = parkingRecordService.listVOPage(pageParam, plateNumber, recordStatus, entryStart, entryEnd);
        return Result.success(result);
    }

    @GetMapping("/detail/{id}")
    public Result<ParkingRecord> detail(@PathVariable Long id) {
        ParkingRecord record = parkingRecordService.getById(id);
        return Result.success(record);
    }
}
