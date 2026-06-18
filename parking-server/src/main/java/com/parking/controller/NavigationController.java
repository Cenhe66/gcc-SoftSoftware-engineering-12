package com.parking.controller;

import com.parking.service.NavigationService;
import com.parking.vo.NavigationVO;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/navigation")
public class NavigationController {

    @Autowired
    private NavigationService navigationService;

    @GetMapping("/ar-guide")
    public Result<NavigationVO> arGuide(
            @RequestParam Long spaceId,
            @RequestParam BigDecimal currentX,
            @RequestParam BigDecimal currentY) {
        NavigationVO vo = navigationService.navigateToSpace(spaceId, currentX, currentY);
        return Result.success(vo);
    }
}
