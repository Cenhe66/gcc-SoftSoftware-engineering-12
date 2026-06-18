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
    public DashboardVO getDashboardData() {
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
        vo.setHourlyFlow(buildHourlyFlow(todayRecords));
        vo.setLotStatusList(buildLotStatusList(lots, spaces));
        vo.setRecentRecords(buildRecentRecords());
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

    private List<Map<String, Object>> buildLotStatusList(List<ParkingLot> lots, List<ParkingSpace> spaces) {
        List<Map<String, Object>> list = new ArrayList<>();
        for (ParkingLot lot : lots) {
            Map<String, Object> map = new HashMap<>();
            int total = 0;
            int occ = 0;
            for (ParkingSpace s : spaces) {
                if (s.getLotId().equals(lot.getId())) {
                    total++;
                    if (s.getStatus() != null && s.getStatus() == 1) {
                        occ++;
                    }
                }
            }
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
}
