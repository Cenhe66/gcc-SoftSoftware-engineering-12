package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.MoveCarMessageSendDTO;
import com.parking.entity.MoveCarMessage;
import com.parking.mapper.MoveCarMessageMapper;
import com.parking.service.MoveCarMessageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MoveCarMessageServiceImpl extends ServiceImpl<MoveCarMessageMapper, MoveCarMessage> implements MoveCarMessageService {

    @Override
    @Transactional
    public MoveCarMessage send(MoveCarMessageSendDTO sendDTO) {
        MoveCarMessage message = new MoveCarMessage();
        message.setRequestId(sendDTO.getRequestId());
        message.setSenderId(sendDTO.getSenderId());
        message.setReceiverId(sendDTO.getReceiverId());
        message.setMsgType(sendDTO.getMsgType() != null ? sendDTO.getMsgType() : 0);
        message.setContent(sendDTO.getContent());
        message.setTemplateCode(sendDTO.getTemplateCode());
        message.setIsRead(0);
        baseMapper.insert(message);
        return message;
    }

    @Override
    public List<MoveCarMessage> listByRequestId(Long requestId) {
        return baseMapper.selectByRequestId(requestId);
    }

    @Override
    public List<MoveCarMessage> listByReceiverId(Long receiverId) {
        return baseMapper.selectByReceiverId(receiverId);
    }

    @Override
    @Transactional
    public boolean markRead(Long receiverId) {
        return baseMapper.markReadByReceiverId(receiverId) > 0;
    }
}
