package com.parking.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.parking.entity.*;
import com.parking.mapper.*;
import com.parking.service.DashboardService;
import com.parking.vo.DashboardVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private ParkingLotMapper parkingLotMapper;

    @Autowired
    private ParkingSpaceMapper parkingSpaceMapper;

    @Autowired
    private ParkingRecordMapper parkingRecordMapper;

    @Autowired
    private ReservationMapper reservationMapper;

    @Autowired
    private ShareRecordMapper shareRecordMapper;

    @Autowired
    private PaymentOrderMapper paymentOrderMapper;

    @Override
    public DashboardVO getDashboardData(String range) {
        DashboardVO vo = new DashboardVO();
        List<ParkingLot> lots = parkingLotMapper.selectList(new QueryWrapper<>());
        vo.setTotalLots(lots.size());
        List<ParkingSpace> spaces = parkingSpaceMapper.selectList(new QueryWrapper<ParkingSpace>().eq("deleted", 0));
        vo.setTotalSpaces(spaces.size());
        int occupied = 0;
        for (ParkingSpace s : spaces) {
            if (s.getStatus() != null && s.getStatus() == 1) {
                occupied++;
            }
        }
        vo.setOccupiedSpaces(occupied);
        vo.setAvailableSpaces(spaces.size() - occupied);
        if (spaces.size() > 0) {
            vo.setOccupancyRate(new BigDecimal(occupied * 100).divide(new BigDecimal(spaces.size()), 2, RoundingMode.HALF_UP));
        } else {
            vo.setOccupancyRate(BigDecimal.ZERO);
        }
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.plusDays(1).atStartOfDay();
        List<ParkingRecord> todayRecords = parkingRecordMapper.selectList(
                new QueryWrapper<ParkingRecord>()
                        .ge("entry_time", startOfDay)
                        .lt("entry_time", endOfDay)
                        .eq("deleted", 0));
        vo.setTodayEntries(todayRecords.size());
        int exits = 0;
        BigDecimal revenue = BigDecimal.ZERO;
        for (ParkingRecord r : todayRecords) {
            if (r.getExitTime() != null) {
                exits++;
            }
            if (r.getFee() != null) {
                revenue = revenue.add(r.getFee());
            }
        }
        vo.setTodayExits(exits);
        vo.setTodayRevenue(revenue);
        List<Reservation> todayReservations = reservationMapper.selectList(
                new QueryWrapper<Reservation>()
                        .ge("create_time", startOfDay)
                        .lt("create_time", endOfDay)
                        .eq("deleted", 0));
        vo.setTodayReservations(todayReservations.size());
        List<ShareRecord> activeShares = shareRecordMapper.selectList(
                new QueryWrapper<ShareRecord>()
                        .eq("status", 1)
                        .eq("deleted", 0));
        vo.setActiveShares(activeShares.size());
        if ("week".equals(range)) {
            vo.setHourlyFlow(buildWeeklyFlow());
        } else {
            vo.setHourlyFlow(buildHourlyFlow(todayRecords));
        }
        vo.setLotStatusList(buildLotStatusList(lots));
        vo.setRecentRecords(buildRecentRecords());
        vo.setRevenueTrend(buildRevenueTrend());
        buildLotHourlyHeatmap(vo, todayRecords, lots);
        return vo;
    }

    private List<Map<String, Object>> buildHourlyFlow(List<ParkingRecord> todayRecords) {
        List<Map<String, Object>> list = new ArrayList<>();
        int[] entries = new int[24];
        int[] exits = new int[24];
        for (ParkingRecord r : todayRecords) {
            if (r.getEntryTime() != null) {
                entries[r.getEntryTime().getHour()]++;
            }
            if (r.getExitTime() != null) {
                exits[r.getExitTime().getHour()]++;
            }
        }
        for (int i = 0; i < 24; i++) {
            Map<String, Object> map = new HashMap<>();
            map.put("hour", String.format("%02d:00", i));
            map.put("entries", entries[i]);
            map.put("exits", exits[i]);
            list.add(map);
        }
        return list;
    }

    private List<Map<String, Object>> buildWeeklyFlow() {
        LocalDate today = LocalDate.now();
        LocalDate monday = today.minusDays(today.getDayOfWeek().getValue() - 1);
        LocalDateTime startOfWeek = monday.atStartOfDay();
        LocalDateTime endOfWeek = today.plusDays(1).atStartOfDay();
        List<ParkingRecord> weekRecords = parkingRecordMapper.selectList(
                new QueryWrapper<ParkingRecord>()
                        .ge("entry_time", startOfWeek)
                        .lt("entry_time", endOfWeek)
                        .eq("deleted", 0));
        int[] dailyEntries = new int[7];
        int[] dailyExits = new int[7];
        String[] weekDays = {"周一", "周二", "周三", "周四", "周五", "周六", "周日"};
        for (ParkingRecord r : weekRecords) {
            if (r.getEntryTime() != null) {
                int dayIndex = r.getEntryTime().getDayOfWeek().getValue() - 1;
                dailyEntries[dayIndex]++;
            }
            if (r.getExitTime() != null) {
                int dayIndex = r.getExitTime().getDayOfWeek().getValue() - 1;
                dailyExits[dayIndex]++;
            }
        }
        List<Map<String, Object>> list = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            Map<String, Object> map = new HashMap<>();
            map.put("hour", weekDays[i]);
            map.put("entries", dailyEntries[i]);
            map.put("exits", dailyExits[i]);
            list.add(map);
        }
        return list;
    }

    private List<Map<String, Object>> buildLotStatusList(List<ParkingLot> lots) {
        List<Map<String, Object>> list = new ArrayList<>();
        List<Map<String, Object>> stats = parkingSpaceMapper.selectSpaceStatsGroupByLot();
        Map<Long, Map<String, Object>> statsMap = new HashMap<>();
        for (Map<String, Object> stat : stats) {
            Long lotId = ((Number) stat.get("lotId")).longValue();
            statsMap.put(lotId, stat);
        }
        for (ParkingLot lot : lots) {
            Map<String, Object> map = new HashMap<>();
            Map<String, Object> stat = statsMap.get(lot.getId());
            int total = stat != null ? ((Number) stat.get("total")).intValue() : 0;
            int occ = stat != null ? ((Number) stat.get("occupied")).intValue() : 0;
            map.put("lotId", lot.getId());
            map.put("lotName", lot.getName());
            map.put("totalSpaces", total);
            map.put("occupiedSpaces", occ);
            map.put("availableSpaces", total - occ);
            list.add(map);
        }
        return list;
    }

    private List<Map<String, Object>> buildRecentRecords() {
        List<Map<String, Object>> list = new ArrayList<>();
        List<ParkingRecord> records = parkingRecordMapper.selectList(
                new QueryWrapper<ParkingRecord>()
                        .eq("deleted", 0)
                        .orderByDesc("entry_time")
                        .last("LIMIT 10"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
        for (ParkingRecord r : records) {
            Map<String, Object> map = new HashMap<>();
            map.put("plateNumber", r.getPlateNumber());
            map.put("entryTime", r.getEntryTime() != null ? r.getEntryTime().format(formatter) : "");
            map.put("exitTime", r.getExitTime() != null ? r.getExitTime().format(formatter) : "-");
            map.put("status", r.getRecordStatus() == 0 ? "进行中" : "已完成");
            list.add(map);
        }
        return list;
    }

    private List<Map<String, Object>> buildRevenueTrend() {
        LocalDate today = LocalDate.now();
        LocalDateTime startDate = today.minusDays(6).atStartOfDay();
        List<Map<String, Object>> rawList = parkingRecordMapper.selectRevenueTrend(startDate);

        Map<LocalDate, BigDecimal> revenueMap = new HashMap<>();
        for (Map<String, Object> raw : rawList) {
            java.sql.Date sqlDate = (java.sql.Date) raw.get("date");
            LocalDate date = sqlDate.toLocalDate();
            BigDecimal revenue = (BigDecimal) raw.get("revenue");
            revenueMap.put(date, revenue);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("M/d");
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Map<String, Object> map = new HashMap<>();
            map.put("date", date.format(formatter));
            map.put("revenue", revenueMap.getOrDefault(date, BigDecimal.ZERO));
            result.add(map);
        }
        return result;
    }

    private void buildLotHourlyHeatmap(DashboardVO vo, List<ParkingRecord> todayRecords, List<ParkingLot> lots) {
        // 初始化每个停车场的12个时段（每2小时）进场计数
        Map<String, int[]> lotCounts = new LinkedHashMap<>();
        for (ParkingLot lot : lots) {
            lotCounts.put(lot.getName(), new int[12]);
        }

        // 按停车场ID查找名称的缓存
        Map<Long, String> lotNameMap = new HashMap<>();
        for (ParkingLot lot : lots) {
            lotNameMap.put(lot.getId(), lot.getName());
        }

        // 统计今日各停车场各时段进场数
        for (ParkingRecord r : todayRecords) {
            if (r.getEntryTime() != null && r.getLotId() != null) {
                String lotName = lotNameMap.get(r.getLotId());
                if (lotName != null) {
                    int slot = r.getEntryTime().getHour() / 2;
                    if (slot >= 0 && slot < 12) {
                        lotCounts.get(lotName)[slot]++;
                    }
                }
            }
        }

        // 生成 Y 轴标签（停车场名称列表）
        List<String> heatmapLots = new ArrayList<>(lotCounts.keySet());
        vo.setHeatmapLots(heatmapLots);

        // 生成热力图数据 [[x, y, value], ...]
        List<Map<String, Object>> heatmapData = new ArrayList<>();
        int y = 0;
        for (Map.Entry<String, int[]> entry : lotCounts.entrySet()) {
            int[] counts = entry.getValue();
            for (int x = 0; x < 12; x++) {
                Map<String, Object> point = new HashMap<>();
                point.put("x", x);
                point.put("y", y);
                point.put("value", counts[x]);
                heatmapData.add(point);
            }
            y++;
        }
        vo.setHeatmapData(heatmapData);
    }
}
