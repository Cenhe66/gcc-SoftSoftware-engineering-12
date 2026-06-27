package com.parking.controller;

import com.parking.entity.ParkingLot;
import com.parking.service.ParkingLotService;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking-lot")
public class ParkingLotController {

    @Autowired
    private ParkingLotService parkingLotService;

    @GetMapping("/list")
    public Result<List<ParkingLot>> list() {
        List<ParkingLot> list = parkingLotService.list();
        return Result.success(list);
    }

    @GetMapping("/detail/{id}")
    public Result<ParkingLot> detail(@PathVariable Long id) {
        ParkingLot lot = parkingLotService.getDetailWithStats(id);
        return Result.success(lot);
    }

    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody ParkingLot parkingLot) {
        boolean success = parkingLotService.save(parkingLot);
        return Result.success(success);
    }

    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody ParkingLot parkingLot) {
        boolean success = parkingLotService.updateById(parkingLot);
        return Result.success(success);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean success = parkingLotService.removeById(id);
        return Result.success(success);
    }
}
