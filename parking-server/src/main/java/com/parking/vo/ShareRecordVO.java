package com.parking.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 共享记录视图对象
 */
@Data
public class ShareRecordVO {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private Long spaceId;
    private Long parkingId;
    private String parkingName;
    private String spaceCode;
    private Integer spaceType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal pricePerHour;
    private Integer status;  // 0-待审核 1-共享中 2-已暂停 3-已结束
    private String statusText;
    private BigDecimal totalEarnings;
    private Integer sharedHours;
    private LocalDateTime createTime;
}