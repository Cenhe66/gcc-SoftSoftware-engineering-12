package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.LoginDTO;
import com.parking.dto.UserUpdateDTO;
import com.parking.entity.User;

import java.math.BigDecimal;

public interface UserService extends IService<User> {

    User wxLogin(LoginDTO loginDTO);

    User adminLogin(com.parking.dto.AdminLoginDTO loginDTO);

    User getByOpenid(String openid);

    boolean updateUserInfo(Long userId, UserUpdateDTO updateDTO);

    /**
     * 检查用户余额是否足够
     */
    boolean checkBalance(Long userId, BigDecimal amount);

    /**
     * 扣减用户余额
     */
    boolean deductBalance(Long userId, BigDecimal amount);

    /**
     * 增加用户余额（退款）
     */
    boolean addBalance(Long userId, BigDecimal amount);
}
