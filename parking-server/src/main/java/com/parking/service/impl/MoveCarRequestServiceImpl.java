package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.MoveCarRequestCreateDTO;
import com.parking.entity.MoveCarRequest;
import com.parking.entity.ParkingRecord;
import com.parking.entity.ParkingSpace;
import com.parking.entity.User;
import com.parking.mapper.MoveCarRequestMapper;
import com.parking.mapper.ParkingRecordMapper;
import com.parking.service.MoveCarRequestService;
import com.parking.service.ParkingSpaceService;
import com.parking.service.UserService;
import com.parking.service.WxMsgService;
import com.parking.websocket.ParkingWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MoveCarRequestServiceImpl extends ServiceImpl<MoveCarRequestMapper, MoveCarRequest> implements MoveCarRequestService {

    @Autowired
    private ParkingRecordMapper parkingRecordMapper;

    @Autowired
    private ParkingSpaceService parkingSpaceService;

    @Autowired
    private UserService userService;

    @Autowired
    private WxMsgService wxMsgService;

    @Autowired
    private ParkingWebSocketHandler webSocketHandler;

    @Override
    @Transactional
    public MoveCarRequest create(MoveCarRequestCreateDTO createDTO) {
        // 校验目标车位当前是否被占用
        ParkingRecord ongoingRecord = parkingRecordMapper.selectOngoingBySpaceId(createDTO.getTargetSpaceId());
        if (ongoingRecord == null) {
            throw new RuntimeException("该车位当前无车辆停放，无需挪车");
        }

        // 检查是否已有同一车位、同一请求人的活跃请求
        if (createDTO.getRequesterId() != null) {
            List<MoveCarRequest> existing = baseMapper.selectActiveByRequesterAndSpace(
                    createDTO.getRequesterId(), createDTO.getTargetSpaceId());
            if (!existing.isEmpty()) {
                return existing.get(0);
            }
        }

        Long requesterId = createDTO.getRequesterId();
        if (requesterId == null) {
            requesterId = 0L; // 匿名请求用 0 占位
        }

        MoveCarRequest request = new MoveCarRequest();
        request.setRequesterId(requesterId);
        request.setTargetPlate(ongoingRecord.getPlateNumber());
        request.setTargetSpaceId(createDTO.getTargetSpaceId());
        request.setTargetUserId(ongoingRecord.getUserId());
        request.setReason(createDTO.getReason());
        request.setStatus(0);
        baseMapper.insert(request);

        // WebSocket / 订阅消息通知目标车主（仅非匿名请求时发送）
        if (requesterId > 0 && ongoingRecord.getUserId() != null) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("event", "move_car_request");
            payload.put("requestId", request.getId());
            payload.put("spaceId", request.getTargetSpaceId());
            payload.put("reason", request.getReason());
            webSocketHandler.sendToUser(String.valueOf(ongoingRecord.getUserId()), payload);

            // 微信订阅消息通知
            User targetUser = userService.getById(ongoingRecord.getUserId());
            if (targetUser != null && targetUser.getOpenid() != null) {
                ParkingSpace space = parkingSpaceService.getById(createDTO.getTargetSpaceId());
                String parkingName = space != null ? space.getSpaceNo() : "";
                wxMsgService.sendMoveCarMsg(
                        targetUser.getOpenid(),
                        ongoingRecord.getPlateNumber(),
                        parkingName,
                        space != null ? space.getSpaceNo() : "",
                        createDTO.getReason()
                );
            }
        }

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

    @Override
    public List<MoveCarRequest> listByTargetUserId(Long targetUserId) {
        return baseMapper.selectByTargetUserId(targetUserId);
    }
}
