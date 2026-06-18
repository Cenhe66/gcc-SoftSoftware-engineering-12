package com.parking.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class HealthCheckCreateDTO {

    @NotNull(message = "停车记录ID不能为空")
    private Long recordId;

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotBlank(message = "车牌号不能为空")
    private String plateNumber;

    @NotNull(message = "检测类型不能为空")
    private Integer checkType;

    @NotNull(message = "检测结果不能为空")
    private Integer checkResult;

    private String description;

    private String imageUrl;
}
