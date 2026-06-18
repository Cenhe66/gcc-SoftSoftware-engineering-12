package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.PayCallbackDTO;
import com.parking.dto.PayCreateDTO;
import com.parking.entity.PaymentOrder;

public interface PaymentOrderService extends IService<PaymentOrder> {

    PaymentOrder createOrder(PayCreateDTO createDTO);

    PaymentOrder payCallback(PayCallbackDTO callbackDTO);

    PaymentOrder getByOrderNo(String orderNo);

    PaymentOrder getByBiz(Integer bizType, Long bizId);
}
