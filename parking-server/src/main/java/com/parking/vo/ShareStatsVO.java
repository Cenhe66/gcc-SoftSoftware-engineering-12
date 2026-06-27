package com.parking.vo;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 共享统计视图对象
 */
@Data
public class ShareStatsVO {
    private Integer totalSharedCount;    // 总共享次数
    private Integer activeCount;         // 进行中数量
    private BigDecimal totalEarnings;    // 总收益
    private BigDecimal thisMonthEarnings; // 本月收益
    private Integer totalSharedHours;    // 总共享时长（小时）
}