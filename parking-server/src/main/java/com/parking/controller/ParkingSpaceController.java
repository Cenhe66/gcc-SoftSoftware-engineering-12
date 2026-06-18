package com.parking.controller;

import com.parking.entity.ParkingSpace;
import com.parking.service.ParkingSpaceService;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking-space")
public class ParkingSpaceController {

    @Autowired
    private ParkingSpaceService parkingSpaceService;

    @GetMapping("/list")
    public Result<List<ParkingSpace>> list(@RequestParam Long lotId) {
        List<ParkingSpace> list = parkingSpaceService.listByLotId(lotId);
        return Result.success(list);
    }

    @GetMapping("/available")
    public Result<List<ParkingSpace>> available(@RequestParam Long lotId) {
        List<ParkingSpace> list = parkingSpaceService.listAvailableByLotId(lotId);
        return Result.success(list);
    }

    @GetMapping("/detail/{id}")
    public Result<ParkingSpace> detail(@PathVariable Long id) {
        ParkingSpace space = parkingSpaceService.getById(id);
        return Result.success(space);
    }

    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody ParkingSpace parkingSpace) {
        boolean success = parkingSpaceService.save(parkingSpace);
        return Result.success(success);
    }

    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody ParkingSpace parkingSpace) {
        boolean success = parkingSpaceService.updateById(parkingSpace);
        return Result.success(success);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean success = parkingSpaceService.removeById(id);
        return Result.success(success);
    }

    @PutMapping("/status/{id}")
    public Result<Boolean> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        boolean success = parkingSpaceService.updateStatus(id, status);
        return Result.success(success);
    }

    @PutMapping("/lock/{id}")
    public Result<Boolean> updateLockStatus(@PathVariable Long id, @RequestParam Integer lockStatus) {
        boolean success = parkingSpaceService.updateLockStatus(id, lockStatus);
        return Result.success(success);
    }
}
