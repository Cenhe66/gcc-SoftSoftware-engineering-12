package com.parking.controller;

import com.parking.dto.LoginDTO;
import com.parking.dto.UserUpdateDTO;
import com.parking.entity.User;
import com.parking.service.UserService;
import com.parking.vo.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public Result<User> login(@RequestBody @Validated LoginDTO loginDTO) {
        User user = userService.wxLogin(loginDTO);
        return Result.success(user);
    }

    @GetMapping("/info/{id}")
    public Result<User> getUserInfo(@PathVariable Long id) {
        User user = userService.getById(id);
        return Result.success(user);
    }

    @PutMapping("/update/{id}")
    public Result<Boolean> updateUserInfo(@PathVariable Long id, @RequestBody UserUpdateDTO updateDTO) {
        boolean success = userService.updateUserInfo(id, updateDTO);
        return Result.success(success);
    }
}
