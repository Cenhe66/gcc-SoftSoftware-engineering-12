package com.parking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("parking_lot")
public class ParkingLot {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String address;

    private Integer totalSpaces;

    private Integer availableSpaces;

    @TableField(exist = false)
    private Integer occupiedSpaces;

    private BigDecimal hourlyRate;

    private BigDecimal dailyCap;

    private Integer freeMinutes;

    private Integer status;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
