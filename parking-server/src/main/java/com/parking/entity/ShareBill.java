package com.parking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("share_bill")
public class ShareBill {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long shareRecordId;

    private Long ownerId;

    private Long renterId;

    private Long spaceId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal durationHours;

    private BigDecimal totalAmount;

    private BigDecimal ownerShare;

    private BigDecimal platformShare;

    private LocalDate billDate;

    private Integer status;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
