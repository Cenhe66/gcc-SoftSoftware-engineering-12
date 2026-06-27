package com.parking.service.impl;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.PayCallbackDTO;
import com.parking.dto.PayCreateDTO;
import com.parking.entity.PaymentOrder;
import com.parking.entity.Reservation;
import com.parking.mapper.PaymentOrderMapper;
import com.parking.mapper.ReservationMapper;
import com.parking.service.PaymentOrderService;
import com.parking.service.ParkingSpaceService;
import com.parking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class PaymentOrderServiceImpl extends ServiceImpl<PaymentOrderMapper, PaymentOrder> implements PaymentOrderService {

    @Autowired
    private UserService userService;

    @Autowired
    private ReservationMapper reservationMapper;

    @Autowired
    private ParkingSpaceService parkingSpaceService;

    @Override
    @Transactional
    public PaymentOrder createOrder(PayCreateDTO createDTO) {
        // 如果是余额支付(payChannel=2)，检查并扣减余额
        if (createDTO.getPayChannel() != null && createDTO.getPayChannel() == 2) {
            BigDecimal amount = createDTO.getAmount();
            if (!userService.checkBalance(createDTO.getUserId(), amount)) {
                throw new RuntimeException("余额不足");
            }
            // 扣减余额
            userService.deductBalance(createDTO.getUserId(), amount);
        }

        // 创建支付订单
        PaymentOrder order = new PaymentOrder();
        order.setOrderNo("PAY" + IdUtil.fastSimpleUUID().substring(0, 16));
        order.setUserId(createDTO.getUserId());
        order.setBizType(createDTO.getBizType());
        order.setBizId(createDTO.getBizId());
        order.setAmount(createDTO.getAmount());
        order.setPayChannel(createDTO.getPayChannel() != null ? createDTO.getPayChannel() : 1);
        // 余额支付直接标记为已支付，微信支付需要回调
        order.setPayStatus(createDTO.getPayChannel() == 2 ? 2 : 0);
        baseMapper.insert(order);

        // 如果是余额支付且已支付成功，直接处理业务状态
        if (order.getPayStatus() == 2) {
            processBizStatus(order);
        }

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
        // 更新支付订单状态
        baseMapper.updatePaySuccess(order.getId(), 2, callbackDTO.getTransactionId());
        order.setPayStatus(2);
        order.setTransactionId(callbackDTO.getTransactionId());

        // 处理业务状态
        processBizStatus(order);

        return order;
    }

    /**
     * 支付成功后处理业务状态
     */
    private void processBizStatus(PaymentOrder order) {
        // bizType: 1-停车费 2-预约费
        if (order.getBizType() == 2) {
            // 预约费支付成功，更新预约状态
            Reservation reservation = reservationMapper.selectById(order.getBizId());
            if (reservation != null && reservation.getStatus() == 4) {
                // 待支付(4) -> 待使用(0)，并锁定车位
                reservationMapper.updateStatus(reservation.getId(), 0);
                parkingSpaceService.updateStatus(reservation.getSpaceId(), 2);
            }
        } else if (order.getBizType() == 1) {
            // 停车费支付成功，将状态从待支付停车费(6)更新为已完成(2)
            Reservation reservation = reservationMapper.selectById(order.getBizId());
            if (reservation != null && reservation.getStatus() == 6) {
                reservationMapper.updateStatus(reservation.getId(), 2);
            }
        }
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
