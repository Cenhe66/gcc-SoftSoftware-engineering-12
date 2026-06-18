package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.PaymentOrder;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface PaymentOrderMapper extends BaseMapper<PaymentOrder> {

    @Select("SELECT * FROM payment_order WHERE order_no = #{orderNo} AND deleted = 0 LIMIT 1")
    PaymentOrder selectByOrderNo(@Param("orderNo") String orderNo);

    @Select("SELECT * FROM payment_order WHERE biz_type = #{bizType} AND biz_id = #{bizId} AND deleted = 0 LIMIT 1")
    PaymentOrder selectByBiz(@Param("bizType") Integer bizType, @Param("bizId") Long bizId);

    @Update("UPDATE payment_order SET pay_status = #{payStatus}, transaction_id = #{transactionId}, pay_time = NOW() WHERE id = #{id}")
    int updatePaySuccess(@Param("id") Long id, @Param("payStatus") Integer payStatus,
                         @Param("transactionId") String transactionId);
}
