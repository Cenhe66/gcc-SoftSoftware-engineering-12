package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.HealthCheckCreateDTO;
import com.parking.entity.HealthCheckLog;
import com.parking.mapper.HealthCheckLogMapper;
import com.parking.service.HealthCheckLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HealthCheckLogServiceImpl extends ServiceImpl<HealthCheckLogMapper, HealthCheckLog> implements HealthCheckLogService {

    @Override
    @Transactional
    public HealthCheckLog create(HealthCheckCreateDTO createDTO) {
        HealthCheckLog log = new HealthCheckLog();
        log.setRecordId(createDTO.getRecordId());
        log.setUserId(createDTO.getUserId());
        log.setPlateNumber(createDTO.getPlateNumber());
        log.setCheckType(createDTO.getCheckType());
        log.setCheckResult(createDTO.getCheckResult());
        log.setDescription(createDTO.getDescription());
        log.setImageUrl(createDTO.getImageUrl());
        log.setIsNotified(0);
        baseMapper.insert(log);
        return log;
    }

    @Override
    public List<HealthCheckLog> listByRecordId(Long recordId) {
        return baseMapper.selectByRecordId(recordId);
    }

    @Override
    public List<HealthCheckLog> listByUserId(Long userId) {
        return baseMapper.selectByUserId(userId);
    }

    @Override
    public List<HealthCheckLog> listByPlateNumber(String plateNumber) {
        return baseMapper.selectByPlateNumber(plateNumber);
    }

    @Override
    public List<HealthCheckLog> listUnnotifiedAbnormal() {
        return baseMapper.selectUnnotifiedAbnormal();
    }

    @Override
    @Transactional
    public boolean markNotified(Long id) {
        return baseMapper.updateNotified(id) > 0;
    }
}
