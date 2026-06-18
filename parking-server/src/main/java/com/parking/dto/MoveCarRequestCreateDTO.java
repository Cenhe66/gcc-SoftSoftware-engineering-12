package com.parking.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class MoveCarRequestCreateDTO {

    @NotNull(message = "请求人用户ID不能为空")
    private Long requesterId;

    @NotBlank(message = "目标车牌号不能为空")
    private String targetPlate;

    private Long targetSpaceId;

    private String reason;
}
