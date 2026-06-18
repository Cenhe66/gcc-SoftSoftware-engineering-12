package com.parking.controller;

import com.parking.service.DeparturePredictionService;
import com.parking.vo.DeparturePredictionVO;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/prediction")
public class DeparturePredictionController {

    @Autowired
    private DeparturePredictionService departurePredictionService;

    @GetMapping("/record/{recordId}")
    public Result<DeparturePredictionVO> predictByRecordId(@PathVariable Long recordId) {
        DeparturePredictionVO vo = departurePredictionService.predictByRecordId(recordId);
        return Result.success(vo);
    }

    @GetMapping("/lot/{lotId}")
    public Result<List<DeparturePredictionVO>> predictByLotId(@PathVariable Long lotId) {
        List<DeparturePredictionVO> list = departurePredictionService.predictByLotId(lotId);
        return Result.success(list);
    }
}
