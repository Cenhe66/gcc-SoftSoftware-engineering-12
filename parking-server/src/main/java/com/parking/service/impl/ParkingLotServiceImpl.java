package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.entity.ParkingLot;
import com.parking.mapper.ParkingLotMapper;
import com.parking.mapper.ParkingSpaceMapper;
import com.parking.service.ParkingLotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ParkingLotServiceImpl extends ServiceImpl<ParkingLotMapper, ParkingLot> implements ParkingLotService {

    @Autowired
    private ParkingSpaceMapper parkingSpaceMapper;

    @Override
    public List<ParkingLot> list() {
        List<ParkingLot> lots = super.list();
        if (lots == null || lots.isEmpty()) {
            return lots;
        }

        List<Map<String, Object>> stats = parkingSpaceMapper.selectSpaceStatsGroupByLot();
        Map<Long, Map<String, Object>> statsMap = new HashMap<>();
        for (Map<String, Object> stat : stats) {
            Long lotId = ((Number) stat.get("lotId")).longValue();
            statsMap.put(lotId, stat);
        }

        for (ParkingLot lot : lots) {
            Map<String, Object> stat = statsMap.get(lot.getId());
            if (stat != null) {
                int total = ((Number) stat.get("total")).intValue();
                int occupied = ((Number) stat.get("occupied")).intValue();
                lot.setTotalSpaces(total);
                lot.setOccupiedSpaces(occupied);
                lot.setAvailableSpaces(total - occupied);
            } else {
                lot.setTotalSpaces(0);
                lot.setOccupiedSpaces(0);
                lot.setAvailableSpaces(0);
            }
        }
        return lots;
    }

    @Override
    public ParkingLot getDetailWithStats(Long id) {
        ParkingLot lot = super.getById(id);
        if (lot == null) {
            return null;
        }

        Map<String, Object> stat = parkingSpaceMapper.selectSpaceStatsByLotId(id);
        if (stat != null) {
            int total = ((Number) stat.get("total")).intValue();
            int occupied = ((Number) stat.get("occupied")).intValue();
            lot.setTotalSpaces(total);
            lot.setOccupiedSpaces(occupied);
            lot.setAvailableSpaces(total - occupied);
        } else {
            lot.setTotalSpaces(0);
            lot.setOccupiedSpaces(0);
            lot.setAvailableSpaces(0);
        }
        return lot;
    }
}
