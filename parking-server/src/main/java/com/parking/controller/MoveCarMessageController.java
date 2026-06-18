package com.parking.controller;

import com.parking.dto.MoveCarMessageSendDTO;
import com.parking.entity.MoveCarMessage;
import com.parking.service.MoveCarMessageService;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/move-car-msg")
public class MoveCarMessageController {

    @Autowired
    private MoveCarMessageService moveCarMessageService;

    @PostMapping("/send")
    public Result<MoveCarMessage> send(@Valid @RequestBody MoveCarMessageSendDTO sendDTO) {
        MoveCarMessage message = moveCarMessageService.send(sendDTO);
        return Result.success(message);
    }

    @GetMapping("/list/request/{requestId}")
    public Result<List<MoveCarMessage>> listByRequestId(@PathVariable Long requestId) {
        List<MoveCarMessage> list = moveCarMessageService.listByRequestId(requestId);
        return Result.success(list);
    }

    @GetMapping("/list/receiver/{receiverId}")
    public Result<List<MoveCarMessage>> listByReceiverId(@PathVariable Long receiverId) {
        List<MoveCarMessage> list = moveCarMessageService.listByReceiverId(receiverId);
        return Result.success(list);
    }

    @PostMapping("/read/{receiverId}")
    public Result<Boolean> markRead(@PathVariable Long receiverId) {
        boolean success = moveCarMessageService.markRead(receiverId);
        return Result.success(success);
    }
}
