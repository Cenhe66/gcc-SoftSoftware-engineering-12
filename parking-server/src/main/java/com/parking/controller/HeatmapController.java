package com.parking.controller;

import com.parking.service.HeatmapService;
import com.parking.vo.HeatmapVO;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/heatmap")
public class HeatmapController {

    @Autowired
    private HeatmapService heatmapService;

    @GetMapping("/lot/{lotId}")
    public Result<List<HeatmapVO>> getByLotId(@PathVariable Long lotId) {
        List<HeatmapVO> list = heatmapService.getHeatmapByLotId(lotId);
        return Result.success(list);
    }
}
