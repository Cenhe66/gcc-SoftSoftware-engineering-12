package com.parking.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class ReservationCreateDTO {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotNull(message = "停车场ID不能为空")
    private Long lotId;

    @NotNull(message = "车位ID不能为空")
    private Long spaceId;

    @NotBlank(message = "车牌号不能为空")
    private String plateNumber;

    @NotNull(message = "预约开始时间不能为空")
    private LocalDateTime startTime;

    @NotNull(message = "预约结束时间不能为空")
    private LocalDateTime endTime;
}
