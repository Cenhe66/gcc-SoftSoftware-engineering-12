package com.parking.controller;

import com.parking.dto.AdminLoginDTO;
import com.parking.entity.User;
import com.parking.service.UserService;
import com.parking.util.TokenUtil;
import com.parking.vo.AdminLoginVO;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<AdminLoginVO> login(@RequestBody @Validated AdminLoginDTO loginDTO) {
        User user = userService.adminLogin(loginDTO);
        if (user == null) {
            return Result.error("用户名或密码错误");
        }

        String token = TokenUtil.generateToken(user.getId());
        AdminLoginVO vo = new AdminLoginVO();
        vo.setToken(token);
        vo.setUserId(user.getId());
        vo.setNickname(user.getNickname());
        vo.setAvatarUrl(user.getAvatarUrl());
        return Result.success(vo);
    }
}
