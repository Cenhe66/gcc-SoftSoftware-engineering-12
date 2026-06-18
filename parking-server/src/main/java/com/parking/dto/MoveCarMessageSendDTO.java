package com.parking.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class MoveCarMessageSendDTO {

    @NotNull(message = "请求ID不能为空")
    private Long requestId;

    @NotNull(message = "发送者用户ID不能为空")
    private Long senderId;

    @NotNull(message = "接收者用户ID不能为空")
    private Long receiverId;

    private Integer msgType;

    @NotBlank(message = "消息内容不能为空")
    private String content;

    private String templateCode;
}
