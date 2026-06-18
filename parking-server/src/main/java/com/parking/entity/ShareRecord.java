package com.parking.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("share_record")
public class ShareRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long spaceId;

    private Long ownerId;

    private Integer shareType;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal hourlyPrice;

    private BigDecimal monthlyPrice;

    private Integer status;

    @TableLogic
    private Integer deleted;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
