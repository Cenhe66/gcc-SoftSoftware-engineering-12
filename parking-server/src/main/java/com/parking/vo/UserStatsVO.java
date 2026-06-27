package com.parking.vo;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 用户中心统计数据视图对象
 */
@Data
public class UserStatsVO {
    private Integer parkingCount;       // 停车次数
    private Integer reservationCount;   // 预约次数
    private Integer shareCount;         // 共享次数
    private BigDecimal totalEarnings;   // 共享收益
}
