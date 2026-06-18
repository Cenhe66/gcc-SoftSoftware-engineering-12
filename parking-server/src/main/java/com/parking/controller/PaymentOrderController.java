package com.parking.controller;

import com.parking.dto.PayCallbackDTO;
import com.parking.dto.PayCreateDTO;
import com.parking.entity.PaymentOrder;
import com.parking.service.PaymentOrderService;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
public class PaymentOrderController {

    @Autowired
    private PaymentOrderService paymentOrderService;

    @PostMapping("/create")
    public Result<PaymentOrder> create(@RequestBody @Validated PayCreateDTO createDTO) {
        PaymentOrder order = paymentOrderService.createOrder(createDTO);
        return Result.success(order);
    }

    @PostMapping("/callback")
    public Result<PaymentOrder> callback(@RequestBody @Validated PayCallbackDTO callbackDTO) {
        PaymentOrder order = paymentOrderService.payCallback(callbackDTO);
        return Result.success(order);
    }

    @GetMapping("/detail/{orderNo}")
    public Result<PaymentOrder> detail(@PathVariable String orderNo) {
        PaymentOrder order = paymentOrderService.getByOrderNo(orderNo);
        return Result.success(order);
    }

    @GetMapping("/biz")
    public Result<PaymentOrder> getByBiz(@RequestParam Integer bizType, @RequestParam Long bizId) {
        PaymentOrder order = paymentOrderService.getByBiz(bizType, bizId);
        return Result.success(order);
    }
}
