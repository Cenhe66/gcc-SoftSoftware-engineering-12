package com.parking.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class DeparturePredictionVO {

    private Long recordId;

    private Long spaceId;

    private String plateNumber;

    private LocalDateTime entryTime;

    private Integer currentDurationMinutes;

    private Integer predictedRemainMinutes;

    private LocalDateTime predictedExitTime;

    private BigDecimal confidence;

    private String predictionReason;

    private Boolean willLeaveSoon;
}
