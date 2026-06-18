package com.parking.service.impl;

import com.parking.entity.ParkingRecord;
import com.parking.entity.Reservation;
import com.parking.mapper.ParkingRecordMapper;
import com.parking.mapper.ReservationMapper;
import com.parking.service.DeparturePredictionService;
import com.parking.vo.DeparturePredictionVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class DeparturePredictionServiceImpl implements DeparturePredictionService {

    @Autowired
    private ParkingRecordMapper parkingRecordMapper;

    @Autowired
    private ReservationMapper reservationMapper;

    @Override
    public DeparturePredictionVO predictByRecordId(Long recordId) {
        ParkingRecord record = parkingRecordMapper.selectById(recordId);
        if (record == null || record.getRecordStatus() != 0) {
            throw new RuntimeException("停车记录不存在或已结束");
        }
        return doPredict(record);
    }

    @Override
    public List<DeparturePredictionVO> predictByLotId(Long lotId) {
        List<ParkingRecord> records = parkingRecordMapper.selectOngoingByLotId(lotId);
        List<DeparturePredictionVO> result = new ArrayList<>();
        for (ParkingRecord record : records) {
            result.add(doPredict(record));
        }
        return result;
    }

    private DeparturePredictionVO doPredict(ParkingRecord record) {
        LocalDateTime now = LocalDateTime.now();
        int currentDuration = (int) ChronoUnit.MINUTES.between(record.getEntryTime(), now);
        if (currentDuration < 1) currentDuration = 1;
        int remainMinutes = 60;
        BigDecimal confidence = new BigDecimal("0.3");
        String reason = "默认预测";
        boolean willLeaveSoon = false;
        List<Reservation> reservations = reservationMapper.selectActiveBySpaceId(record.getSpaceId());
        if (!reservations.isEmpty()) {
            Reservation next = reservations.get(0);
            long minsToStart = ChronoUnit.MINUTES.between(now, next.getStartTime());
            if (minsToStart > 0 && minsToStart <= 30) {
                remainMinutes = (int) minsToStart;
                confidence = new BigDecimal("0.85");
                reason = "该车位有 upcoming 预约，预计车主将在预约前离场";
                willLeaveSoon = true;
            }
        }
        if (currentDuration >= 120 && currentDuration <= 150) {
            remainMinutes = Math.min(remainMinutes, 30);
            confidence = confidence.max(new BigDecimal("0.6"));
            reason = "停车时长接近2小时，常见短时停车行为，预判即将离场";
            willLeaveSoon = true;
        } else if (currentDuration >= 480 && currentDuration <= 540) {
            remainMinutes = Math.min(remainMinutes, 20);
            confidence = confidence.max(new BigDecimal("0.7"));
            reason = "停车时长接近8小时，符合工作日通勤模式，预判即将离场";
            willLeaveSoon = true;
        }
        if (remainMinutes <= 15) {
            confidence = confidence.max(new BigDecimal("0.9"));
            willLeaveSoon = true;
        }
        confidence = confidence.setScale(2, RoundingMode.HALF_UP);
        DeparturePredictionVO vo = new DeparturePredictionVO();
        vo.setRecordId(record.getId());
        vo.setSpaceId(record.getSpaceId());
        vo.setPlateNumber(record.getPlateNumber());
        vo.setEntryTime(record.getEntryTime());
        vo.setCurrentDurationMinutes(currentDuration);
        vo.setPredictedRemainMinutes(remainMinutes);
        vo.setPredictedExitTime(now.plusMinutes(remainMinutes));
        vo.setConfidence(confidence);
        vo.setPredictionReason(reason);
        vo.setWillLeaveSoon(willLeaveSoon);
        return vo;
    }
}
