package com.parking.controller;

import com.parking.dto.ShareRecordCreateDTO;
import com.parking.entity.ShareRecord;
import com.parking.service.ShareRecordService;
import com.parking.vo.Result;
import com.parking.vo.ShareRecordVO;
import com.parking.vo.ShareStatsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/share-record")
public class ShareRecordController {

    @Autowired
    private ShareRecordService shareRecordService;

    @PostMapping("/publish")
    public Result<ShareRecord> publish(@Valid @RequestBody ShareRecordCreateDTO createDTO) {
        ShareRecord record = shareRecordService.create(createDTO);
        return Result.success(record);
    }

    @PutMapping("/pause/{id}")
    public Result<Boolean> pause(@PathVariable Long id) {
        boolean success = shareRecordService.pause(id);
        return Result.success(success);
    }

    @PutMapping("/resume/{id}")
    public Result<Boolean> resume(@PathVariable Long id) {
        boolean success = shareRecordService.resume(id);
        return Result.success(success);
    }

    @PutMapping("/stop/{id}")
    public Result<Boolean> stop(@PathVariable Long id) {
        boolean success = shareRecordService.stop(id);
        return Result.success(success);
    }

    @GetMapping("/stats")
    public Result<ShareStatsVO> getStats(@RequestParam(required = false) Long ownerId) {
        ShareStatsVO stats = shareRecordService.getStats(ownerId);
        return Result.success(stats);
    }

    @GetMapping("/list")
    public Result<List<ShareRecordVO>> list(@RequestParam(required = false) Long ownerId,
                                            @RequestParam(required = false) String status,
                                            @RequestParam(defaultValue = "1") Integer pageNum,
                                            @RequestParam(defaultValue = "10") Integer pageSize) {
        List<ShareRecordVO> list = shareRecordService.listVO(ownerId, status, pageNum, pageSize);
        return Result.success(list);
    }
}
