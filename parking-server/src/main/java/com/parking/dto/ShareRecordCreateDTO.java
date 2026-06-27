package com.parking.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ShareRecordCreateDTO {

    @NotNull(message = "停车场ID不能为空")
    private Long lotId;

    @NotNull(message = "车位编号不能为空")
    private String spaceNo;

    @NotNull(message = "共享类型不能为空")
    private Integer shareType;

    @NotNull(message = "共享开始时间不能为空")
    private LocalDateTime startTime;

    @NotNull(message = "共享结束时间不能为空")
    private LocalDateTime endTime;

    private BigDecimal hourlyPrice;

    private BigDecimal monthlyPrice;

    private Long userId;
}
