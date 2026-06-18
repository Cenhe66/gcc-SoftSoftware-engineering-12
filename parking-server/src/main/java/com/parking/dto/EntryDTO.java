package com.parking.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class EntryDTO {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotNull(message = "停车场ID不能为空")
    private Long lotId;

    private Long spaceId;

    @NotBlank(message = "车牌号不能为空")
    private String plateNumber;
}
