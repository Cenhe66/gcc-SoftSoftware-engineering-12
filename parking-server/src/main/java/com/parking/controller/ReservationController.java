package com.parking.controller;

import com.parking.dto.ReservationCreateDTO;
import com.parking.entity.Reservation;
import com.parking.service.ReservationService;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/reservation")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @PostMapping("/create")
    public Result<Reservation> create(@Valid @RequestBody ReservationCreateDTO createDTO) {
        Reservation reservation = reservationService.create(createDTO);
        return Result.success(reservation);
    }

    @PostMapping("/cancel/{id}")
    public Result<Boolean> cancel(@PathVariable Long id) {
        boolean success = reservationService.cancel(id);
        return Result.success(success);
    }

    @PostMapping("/entry/{id}")
    public Result<Boolean> entry(@PathVariable Long id) {
        boolean success = reservationService.entry(id);
        return Result.success(success);
    }

    @GetMapping("/list/{userId}")
    public Result<List<Reservation>> listByUserId(@PathVariable Long userId) {
        List<Reservation> list = reservationService.listByUserId(userId);
        return Result.success(list);
    }
}
