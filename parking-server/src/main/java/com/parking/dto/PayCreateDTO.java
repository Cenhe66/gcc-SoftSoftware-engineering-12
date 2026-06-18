package com.parking.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class PayCreateDTO {

    @NotNull(message = "用户ID不能为空")
    private Long userId;

    @NotNull(message = "业务类型不能为空")
    private Integer bizType;

    @NotNull(message = "业务ID不能为空")
    private Long bizId;

    @NotNull(message = "金额不能为空")
    private BigDecimal amount;

    private Integer payChannel;
}
