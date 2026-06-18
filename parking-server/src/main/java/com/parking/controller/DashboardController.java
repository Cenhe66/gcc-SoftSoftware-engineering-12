package com.parking.controller;

import com.parking.service.DashboardService;
import com.parking.vo.DashboardVO;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/data")
    public Result<DashboardVO> getDashboardData() {
        DashboardVO vo = dashboardService.getDashboardData();
        return Result.success(vo);
    }
}
