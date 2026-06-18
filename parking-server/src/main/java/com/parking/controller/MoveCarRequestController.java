package com.parking.controller;

import com.parking.dto.MoveCarRequestCreateDTO;
import com.parking.entity.MoveCarRequest;
import com.parking.service.MoveCarRequestService;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/move-car")
public class MoveCarRequestController {

    @Autowired
    private MoveCarRequestService moveCarRequestService;

    @PostMapping("/request")
    public Result<MoveCarRequest> create(@Valid @RequestBody MoveCarRequestCreateDTO createDTO) {
        MoveCarRequest request = moveCarRequestService.create(createDTO);
        return Result.success(request);
    }

    @PostMapping("/handle/{id}")
    public Result<Boolean> handle(@PathVariable Long id) {
        boolean success = moveCarRequestService.handle(id);
        return Result.success(success);
    }

    @PostMapping("/cancel/{id}")
    public Result<Boolean> cancel(@PathVariable Long id) {
        boolean success = moveCarRequestService.cancel(id);
        return Result.success(success);
    }

    @GetMapping("/list/requester/{requesterId}")
    public Result<List<MoveCarRequest>> listByRequesterId(@PathVariable Long requesterId) {
        List<MoveCarRequest> list = moveCarRequestService.listByRequesterId(requesterId);
        return Result.success(list);
    }

    @GetMapping("/list/plate/{targetPlate}")
    public Result<List<MoveCarRequest>> listByTargetPlate(@PathVariable String targetPlate) {
        List<MoveCarRequest> list = moveCarRequestService.listByTargetPlate(targetPlate);
        return Result.success(list);
    }
}
