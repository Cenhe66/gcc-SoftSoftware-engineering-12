package com.parking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("move_car_request")
public class MoveCarRequest {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long requesterId;

    private String targetPlate;

    private Long targetSpaceId;

    private Long targetUserId;

    private String reason;

    private Integer status;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
