package com.parking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("parking_space")
public class ParkingSpace {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long lotId;

    private String spaceNo;

    private String floor;

    private String area;

    private Integer spaceType;

    private Integer status;

    private Integer lockStatus;

    private BigDecimal coordX;

    private BigDecimal coordY;

    private Long ownerId;

    private Integer isShared;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
