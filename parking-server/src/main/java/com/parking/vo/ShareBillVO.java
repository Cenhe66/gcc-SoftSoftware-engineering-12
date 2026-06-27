package com.parking.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 共享账单视图对象
 */
@Data
public class ShareBillVO {
    private Long id;
    private Long shareRecordId;
    private Long ownerId;
    private String ownerName;
    private Long renterId;
    private String renterName;
    private String parkingName;
    private String spaceCode;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationHours;
    private BigDecimal amount;
    private BigDecimal ownerEarnings;
    private Integer status;  // 0-待支付 1-已支付 2-已退款
    private String statusText;
    private LocalDateTime createTime;
    private LocalDateTime payTime;
}