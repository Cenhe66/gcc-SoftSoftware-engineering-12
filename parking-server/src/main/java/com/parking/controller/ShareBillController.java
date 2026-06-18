package com.parking.controller;

import com.parking.dto.ShareBillCreateDTO;
import com.parking.entity.ShareBill;
import com.parking.service.ShareBillService;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/share-bill")
public class ShareBillController {

    @Autowired
    private ShareBillService shareBillService;

    @PostMapping("/create")
    public Result<ShareBill> create(@Valid @RequestBody ShareBillCreateDTO createDTO) {
        ShareBill bill = shareBillService.createBill(createDTO);
        return Result.success(bill);
    }

    @GetMapping("/owner/{ownerId}")
    public Result<List<ShareBill>> listByOwnerId(@PathVariable Long ownerId) {
        List<ShareBill> list = shareBillService.listByOwnerId(ownerId);
        return Result.success(list);
    }

    @GetMapping("/renter/{renterId}")
    public Result<List<ShareBill>> listByRenterId(@PathVariable Long renterId) {
        List<ShareBill> list = shareBillService.listByRenterId(renterId);
        return Result.success(list);
    }
}
