package com.parking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("parking_record")
public class ParkingRecord {

    @TableId(type = IdType.AUTO)
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

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
