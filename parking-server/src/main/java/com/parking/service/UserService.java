package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.LoginDTO;
import com.parking.dto.UserUpdateDTO;
import com.parking.entity.User;

public interface UserService extends IService<User> {

    User wxLogin(LoginDTO loginDTO);

    User getByOpenid(String openid);

    boolean updateUserInfo(Long userId, UserUpdateDTO updateDTO);
}
