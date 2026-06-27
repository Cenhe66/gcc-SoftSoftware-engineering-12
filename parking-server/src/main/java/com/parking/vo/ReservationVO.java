package com.parking.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 预约详情VO，包含关联的停车场名称和车位编号
 */
@Data
public class ReservationVO {

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

    private LocalDateTime createTime;

    // 关联字段
    private String parkingName;     // 停车场名称
    private String parkingAddress;  // 停车场地址
    private String spaceCode;       // 车位编号
    private String floor;           // 楼层
    private BigDecimal hourlyRate;  // 停车场每小时费率
    
    // 计算字段
    private Integer durationMinutes;  // 实际停车时长（分钟）

    private Boolean isOwnerSelfUse;   // 是否为业主自用私人车位
}