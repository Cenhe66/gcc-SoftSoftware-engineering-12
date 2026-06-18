package com.parking.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ShareRecordCreateDTO {

    @NotNull(message = "车位ID不能为空")
    private Long spaceId;

    @NotNull(message = "业主用户ID不能为空")
    private Long ownerId;

    @NotNull(message = "共享类型不能为空")
    private Integer shareType;

    @NotNull(message = "共享开始时间不能为空")
    private LocalDateTime startTime;

    @NotNull(message = "共享结束时间不能为空")
    private LocalDateTime endTime;

    private BigDecimal hourlyPrice;

    private BigDecimal monthlyPrice;
}
