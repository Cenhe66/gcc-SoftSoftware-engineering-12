package com.parking.controller;

import com.parking.dto.EntryDTO;
import com.parking.dto.ExitDTO;
import com.parking.entity.ParkingRecord;
import com.parking.service.ParkingRecordService;
import com.parking.vo.Result;
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
    public Result<List<ParkingRecord>> listByUserId(@PathVariable Long userId) {
        List<ParkingRecord> list = parkingRecordService.listByUserId(userId);
        return Result.success(list);
    }

    @GetMapping("/detail/{id}")
    public Result<ParkingRecord> detail(@PathVariable Long id) {
        ParkingRecord record = parkingRecordService.getById(id);
        return Result.success(record);
    }
}
