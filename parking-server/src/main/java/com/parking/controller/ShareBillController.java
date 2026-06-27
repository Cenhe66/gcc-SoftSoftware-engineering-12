package com.parking.controller;

import com.parking.dto.ShareBillCreateDTO;
import com.parking.entity.ShareBill;
import com.parking.service.ShareBillService;
import com.parking.vo.Result;
import com.parking.vo.ShareBillVO;
import com.parking.vo.ShareBillStatsVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/share-bill")
public class ShareBillController {

    @Autowired
    private ShareBillService shareBillService;

    @PostMapping("/create")
    public Result<ShareBill> create(@Valid @RequestBody ShareBillCreateDTO createDTO) {
        ShareBill bill = shareBillService.createBill(createDTO);
        return Result.success(bill);
    }

    @GetMapping("/stats")
    public Result<ShareBillStatsVO> getStats() {
        ShareBillStatsVO stats = shareBillService.getStats();
        return Result.success(stats);
    }

    @GetMapping("/list")
    public Result<List<ShareBillVO>> list(@RequestParam(required = false) Long ownerId,
                                          @RequestParam(required = false) Long renterId,
                                          @RequestParam(defaultValue = "1") Integer pageNum,
                                          @RequestParam(defaultValue = "10") Integer pageSize) {
        List<ShareBillVO> list = shareBillService.listVO(ownerId, renterId, pageNum, pageSize);
        return Result.success(list);
    }
}
