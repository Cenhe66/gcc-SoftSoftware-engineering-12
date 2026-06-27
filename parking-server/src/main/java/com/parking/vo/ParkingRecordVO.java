package com.parking.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 停车记录VO，包含关联的停车场名称和车位编号
 */
@Data
public class ParkingRecordVO {

    private Long id;

    private Long userId;

    private Long lotId;

    private Long spaceId;

    private String plateNumber;

    private LocalDateTime entryTime;

    private LocalDateTime exitTime;

    private Integer durationMinutes;

    private BigDecimal fee;

    private BigDecimal paidAmount;

    private Integer payStatus;

    private Integer recordStatus;

    private LocalDateTime createTime;

    // 关联字段
    private String parkingName;     // 停车场名称
    private String parkingAddress;  // 停车场地址
    private String spaceCode;       // 车位编号
    private String floor;           // 楼层
    private BigDecimal hourlyRate;  // 停车场每小时费率
}