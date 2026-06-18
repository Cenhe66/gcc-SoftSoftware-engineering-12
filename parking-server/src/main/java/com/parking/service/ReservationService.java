package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.ReservationCreateDTO;
import com.parking.entity.Reservation;

import java.util.List;

public interface ReservationService extends IService<Reservation> {

    Reservation create(ReservationCreateDTO createDTO);

    boolean cancel(Long id);

    boolean entry(Long id);

    List<Reservation> listByUserId(Long userId);

    void releaseExpiredReservations();
}
