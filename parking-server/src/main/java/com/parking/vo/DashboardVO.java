package com.parking.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class DashboardVO {

    private Integer totalLots;

    private Integer totalSpaces;

    private Integer occupiedSpaces;

    private Integer availableSpaces;

    private BigDecimal occupancyRate;

    private Integer todayEntries;

    private Integer todayExits;

    private BigDecimal todayRevenue;

    private Integer todayReservations;

    private Integer activeShares;

    private List<Map<String, Object>> hourlyFlow;

    private List<Map<String, Object>> lotStatusList;

    private List<Map<String, Object>> recentRecords;

    private List<Map<String, Object>> revenueTrend;

    private List<String> heatmapLots;

    private List<Map<String, Object>> heatmapData;
}
