package com.parking.service.impl;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.PayCallbackDTO;
import com.parking.dto.PayCreateDTO;
import com.parking.entity.PaymentOrder;
import com.parking.mapper.PaymentOrderMapper;
import com.parking.service.PaymentOrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentOrderServiceImpl extends ServiceImpl<PaymentOrderMapper, PaymentOrder> implements PaymentOrderService {

    @Override
    @Transactional
    public PaymentOrder createOrder(PayCreateDTO createDTO) {
        PaymentOrder order = new PaymentOrder();
        order.setOrderNo(IdUtil.fastSimpleUUID());
        order.setUserId(createDTO.getUserId());
        order.setBizType(createDTO.getBizType());
        order.setBizId(createDTO.getBizId());
        order.setAmount(createDTO.getAmount());
        order.setPayChannel(createDTO.getPayChannel() != null ? createDTO.getPayChannel() : 1);
        order.setPayStatus(0);
        baseMapper.insert(order);
        return order;
    }

    @Override
    @Transactional
    public PaymentOrder payCallback(PayCallbackDTO callbackDTO) {
        PaymentOrder order = baseMapper.selectByOrderNo(callbackDTO.getOrderNo());
        if (order == null) {
            throw new RuntimeException("订单不存在");
        }
        if (order.getPayStatus() == 2) {
            throw new RuntimeException("订单已支付");
        }
        baseMapper.updatePaySuccess(order.getId(), 2, callbackDTO.getTransactionId());
        order.setPayStatus(2);
        order.setTransactionId(callbackDTO.getTransactionId());
        return order;
    }

    @Override
    public PaymentOrder getByOrderNo(String orderNo) {
        return baseMapper.selectByOrderNo(orderNo);
    }

    @Override
    public PaymentOrder getByBiz(Integer bizType, Long bizId) {
        return baseMapper.selectByBiz(bizType, bizId);
    }
}
