package com.parking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("move_car_message")
public class MoveCarMessage {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long requestId;

    private Long senderId;

    private Long receiverId;

    private Integer msgType;

    private String content;

    private String templateCode;

    private Integer isRead;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;
}
