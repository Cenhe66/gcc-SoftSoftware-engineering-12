package com.parking.controller;

import com.parking.dto.ReservationCreateDTO;
import com.parking.entity.Reservation;
import com.parking.service.ReservationService;
import com.parking.vo.Result;
import com.parking.vo.ReservationVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservation")
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

    /**
     * 离场：计算停车费
     * @return 返回计算的停车费金额
     */
    @PostMapping("/exit/{id}")
    public Result<BigDecimal> exit(@PathVariable Long id) {
        BigDecimal parkingFee = reservationService.exit(id);
        return Result.success(parkingFee);
    }

    @PostMapping("/pay/{id}")
    public Result<Boolean> pay(@PathVariable Long id) {
        boolean success = reservationService.markPaid(id);
        return Result.success(success);
    }

    /**
     * 支付停车费
     */
    @PostMapping("/pay-parking/{id}")
    public Result<Boolean> payParking(@PathVariable Long id) {
        boolean success = reservationService.markParkingPaid(id);
        return Result.success(success);
    }

    @GetMapping("/list/{userId}")
    public Result<List<ReservationVO>> listByUserId(
            @PathVariable Long userId,
            @RequestParam(required = false) String status) {
        List<ReservationVO> list;
        if (status != null && !status.isEmpty()) {
            // 支持多状态筛选，如 "0,4"
            List<Integer> statusList = Arrays.stream(status.split(","))
                    .map(Integer::parseInt)
                    .collect(Collectors.toList());
            list = reservationService.listVOByUserIdAndStatus(userId, statusList);
        } else {
            list = reservationService.listVOByUserId(userId);
        }
        return Result.success(list);
    }

    @GetMapping("/detail/{id}")
    public Result<ReservationVO> detail(@PathVariable Long id) {
        ReservationVO vo = reservationService.getVOById(id);
        return Result.success(vo);
    }
}
