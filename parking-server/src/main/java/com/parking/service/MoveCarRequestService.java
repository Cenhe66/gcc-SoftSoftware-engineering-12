package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.MoveCarRequestCreateDTO;
import com.parking.entity.MoveCarRequest;

import java.util.List;

public interface MoveCarRequestService extends IService<MoveCarRequest> {

    MoveCarRequest create(MoveCarRequestCreateDTO createDTO);

    boolean handle(Long id);

    boolean cancel(Long id);

    List<MoveCarRequest> listByRequesterId(Long requesterId);

    List<MoveCarRequest> listByTargetPlate(String targetPlate);

    List<MoveCarRequest> listByTargetUserId(Long targetUserId);
}
