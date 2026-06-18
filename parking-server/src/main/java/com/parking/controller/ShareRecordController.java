package com.parking.controller;

import com.parking.dto.ShareRecordCreateDTO;
import com.parking.entity.ShareRecord;
import com.parking.service.ShareRecordService;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/share")
public class ShareRecordController {

    @Autowired
    private ShareRecordService shareRecordService;

    @PostMapping("/create")
    public Result<ShareRecord> create(@Valid @RequestBody ShareRecordCreateDTO createDTO) {
        ShareRecord record = shareRecordService.create(createDTO);
        return Result.success(record);
    }

    @PostMapping("/pause/{id}")
    public Result<Boolean> pause(@PathVariable Long id) {
        boolean success = shareRecordService.pause(id);
        return Result.success(success);
    }

    @PostMapping("/resume/{id}")
    public Result<Boolean> resume(@PathVariable Long id) {
        boolean success = shareRecordService.resume(id);
        return Result.success(success);
    }

    @GetMapping("/list/{ownerId}")
    public Result<List<ShareRecord>> listByOwnerId(@PathVariable Long ownerId) {
        List<ShareRecord> list = shareRecordService.listByOwnerId(ownerId);
        return Result.success(list);
    }
}
