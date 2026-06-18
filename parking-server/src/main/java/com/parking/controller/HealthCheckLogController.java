package com.parking.controller;

import com.parking.dto.HealthCheckCreateDTO;
import com.parking.entity.HealthCheckLog;
import com.parking.service.HealthCheckLogService;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/health-check")
public class HealthCheckLogController {

    @Autowired
    private HealthCheckLogService healthCheckLogService;

    @PostMapping("/create")
    public Result<HealthCheckLog> create(@Valid @RequestBody HealthCheckCreateDTO createDTO) {
        HealthCheckLog log = healthCheckLogService.create(createDTO);
        return Result.success(log);
    }

    @GetMapping("/list/record/{recordId}")
    public Result<List<HealthCheckLog>> listByRecordId(@PathVariable Long recordId) {
        List<HealthCheckLog> list = healthCheckLogService.listByRecordId(recordId);
        return Result.success(list);
    }

    @GetMapping("/list/user/{userId}")
    public Result<List<HealthCheckLog>> listByUserId(@PathVariable Long userId) {
        List<HealthCheckLog> list = healthCheckLogService.listByUserId(userId);
        return Result.success(list);
    }

    @GetMapping("/list/plate/{plateNumber}")
    public Result<List<HealthCheckLog>> listByPlateNumber(@PathVariable String plateNumber) {
        List<HealthCheckLog> list = healthCheckLogService.listByPlateNumber(plateNumber);
        return Result.success(list);
    }

    @GetMapping("/unnotified/abnormal")
    public Result<List<HealthCheckLog>> listUnnotifiedAbnormal() {
        List<HealthCheckLog> list = healthCheckLogService.listUnnotifiedAbnormal();
        return Result.success(list);
    }

    @PostMapping("/notify/{id}")
    public Result<Boolean> markNotified(@PathVariable Long id) {
        boolean success = healthCheckLogService.markNotified(id);
        return Result.success(success);
    }
}
