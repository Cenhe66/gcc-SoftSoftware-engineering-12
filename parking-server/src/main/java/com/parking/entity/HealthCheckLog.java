package com.parking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("health_check_log")
public class HealthCheckLog {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long recordId;

    private Long userId;

    private String plateNumber;

    private Integer checkType;

    private Integer checkResult;

    private String description;

    private String imageUrl;

    private Integer isNotified;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;
}
