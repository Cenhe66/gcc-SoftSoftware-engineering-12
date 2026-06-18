package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.MoveCarMessageSendDTO;
import com.parking.entity.MoveCarMessage;

import java.util.List;

public interface MoveCarMessageService extends IService<MoveCarMessage> {

    MoveCarMessage send(MoveCarMessageSendDTO sendDTO);

    List<MoveCarMessage> listByRequestId(Long requestId);

    List<MoveCarMessage> listByReceiverId(Long receiverId);

    boolean markRead(Long receiverId);
}
