package com.parking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("reservation")
public class Reservation {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long userId;

    private Long lotId;

    private Long spaceId;

    private String plateNumber;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal reserveFee;

    private BigDecimal parkingFee;  // 实际停车费

    private Integer status;

    private LocalDateTime entryTime;

    private LocalDateTime exitTime;  // 离场时间

    private LocalDateTime cancelTime;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
