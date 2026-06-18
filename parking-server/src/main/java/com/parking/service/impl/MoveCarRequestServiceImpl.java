package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.MoveCarRequestCreateDTO;
import com.parking.entity.MoveCarRequest;
import com.parking.mapper.MoveCarRequestMapper;
import com.parking.service.MoveCarRequestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MoveCarRequestServiceImpl extends ServiceImpl<MoveCarRequestMapper, MoveCarRequest> implements MoveCarRequestService {

    @Override
    @Transactional
    public MoveCarRequest create(MoveCarRequestCreateDTO createDTO) {
        MoveCarRequest request = new MoveCarRequest();
        request.setRequesterId(createDTO.getRequesterId());
        request.setTargetPlate(createDTO.getTargetPlate());
        request.setTargetSpaceId(createDTO.getTargetSpaceId());
        request.setReason(createDTO.getReason());
        request.setStatus(0);
        baseMapper.insert(request);
        return request;
    }

    @Override
    @Transactional
    public boolean handle(Long id) {
        MoveCarRequest request = baseMapper.selectById(id);
        if (request == null) {
            throw new RuntimeException("挪车请求不存在");
        }
        if (request.getStatus() != 0) {
            throw new RuntimeException("请求状态异常");
        }
        baseMapper.updateStatus(id, 2);
        return true;
    }

    @Override
    @Transactional
    public boolean cancel(Long id) {
        MoveCarRequest request = baseMapper.selectById(id);
        if (request == null) {
            throw new RuntimeException("挪车请求不存在");
        }
        if (request.getStatus() != 0) {
            throw new RuntimeException("只能取消待处理的请求");
        }
        baseMapper.updateStatus(id, 3);
        return true;
    }

    @Override
    public List<MoveCarRequest> listByRequesterId(Long requesterId) {
        return baseMapper.selectByRequesterId(requesterId);
    }

    @Override
    public List<MoveCarRequest> listByTargetPlate(String targetPlate) {
        return baseMapper.selectByTargetPlate(targetPlate);
    }
}
