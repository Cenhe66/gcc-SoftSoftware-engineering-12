package com.parking.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class ShareBillCreateDTO {

    @NotNull(message = "共享记录ID不能为空")
    private Long shareRecordId;

    @NotNull(message = "租户用户ID不能为空")
    private Long renterId;

    @NotNull(message = "使用开始时间不能为空")
    private LocalDateTime startTime;

    @NotNull(message = "使用结束时间不能为空")
    private LocalDateTime endTime;
}
