package com.parking.vo;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 共享账单统计视图对象
 */
@Data
public class ShareBillStatsVO {
    private Integer totalBillCount;      // 总账单数
    private Integer unpaidCount;         // 待支付数
    private BigDecimal totalEarnings;    // 总收益
    private BigDecimal thisMonthEarnings; // 本月收益
    private BigDecimal pendingAmount;    // 待结算金额
}