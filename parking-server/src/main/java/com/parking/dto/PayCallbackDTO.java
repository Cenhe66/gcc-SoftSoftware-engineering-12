package com.parking.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class PayCallbackDTO {

    @NotBlank(message = "订单号不能为空")
    private String orderNo;

    @NotBlank(message = "交易流水号不能为空")
    private String transactionId;
}
