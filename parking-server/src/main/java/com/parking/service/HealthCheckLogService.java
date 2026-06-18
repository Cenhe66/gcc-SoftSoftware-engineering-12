package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.HealthCheckCreateDTO;
import com.parking.entity.HealthCheckLog;

import java.util.List;

public interface HealthCheckLogService extends IService<HealthCheckLog> {

    HealthCheckLog create(HealthCheckCreateDTO createDTO);

    List<HealthCheckLog> listByRecordId(Long recordId);

    List<HealthCheckLog> listByUserId(Long userId);

    List<HealthCheckLog> listByPlateNumber(String plateNumber);

    List<HealthCheckLog> listUnnotifiedAbnormal();

    boolean markNotified(Long id);
}
