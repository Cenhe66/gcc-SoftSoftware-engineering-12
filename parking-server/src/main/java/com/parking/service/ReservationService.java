package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.ReservationCreateDTO;
import com.parking.entity.Reservation;
import com.parking.vo.ReservationVO;

import java.math.BigDecimal;
import java.util.List;

public interface ReservationService extends IService<Reservation> {

    Reservation create(ReservationCreateDTO createDTO);

    boolean cancel(Long id);

    boolean entry(Long id);

    /**
     * 离场：计算停车费，更新状态为已完成(待支付停车费)
     * @return 计算后的停车费
     */
    BigDecimal exit(Long id);

    /**
     * 标记停车费已支付，完成预约
     */
    boolean markParkingPaid(Long id);

    /**
     * 标记预约已支付
     */
    boolean markPaid(Long id);

    /**
     * 查询用户预约列表（包含关联信息）
     */
    List<ReservationVO> listVOByUserId(Long userId);

    /**
     * 查询用户预约列表（按状态筛选）
     */
    List<ReservationVO> listVOByUserIdAndStatus(Long userId, List<Integer> statusList);

    /**
     * 查询预约详情（包含关联信息）
     */
    ReservationVO getVOById(Long id);

    void releaseExpiredReservations();

    /**
     * 取消未支付超时的预约
     */
    void cancelUnpaidExpired();
}
