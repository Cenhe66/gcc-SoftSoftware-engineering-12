package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.LoginDTO;
import com.parking.dto.UserUpdateDTO;
import com.parking.entity.User;
import com.parking.mapper.UserMapper;
import com.parking.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    public User wxLogin(LoginDTO loginDTO) {
        User user = baseMapper.selectByOpenid(loginDTO.getOpenid());
        if (user == null) {
            user = new User();
            user.setOpenid(loginDTO.getOpenid());
            user.setNickname(loginDTO.getNickname());
            user.setAvatarUrl(loginDTO.getAvatarUrl());
            user.setUserType(0);
            user.setStatus(1);
            user.setBalance(BigDecimal.ZERO);
            baseMapper.insert(user);
        }
        return user;
    }

    @Override
    public User adminLogin(com.parking.dto.AdminLoginDTO loginDTO) {
        User user = baseMapper.selectByUsername(loginDTO.getUsername());
        if (user == null) {
            return null;
        }
        String inputPassword = com.parking.util.TokenUtil.md5Password(loginDTO.getPassword());
        if (!inputPassword.equals(user.getPassword())) {
            return null;
        }
        return user;
    }

    @Override
    public User getByOpenid(String openid) {
        return baseMapper.selectByOpenid(openid);
    }

    @Override
    public boolean updateUserInfo(Long userId, UserUpdateDTO updateDTO) {
        User user = getById(userId);
        if (user == null) {
            return false;
        }
        BeanUtils.copyProperties(updateDTO, user);
        return updateById(user);
    }

    @Override
    public boolean checkBalance(Long userId, BigDecimal amount) {
        User user = getById(userId);
        if (user == null) {
            return false;
        }
        BigDecimal balance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        return balance.compareTo(amount) >= 0;
    }

    @Override
    @Transactional
    public boolean deductBalance(Long userId, BigDecimal amount) {
        User user = getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        BigDecimal balance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        if (balance.compareTo(amount) < 0) {
            throw new RuntimeException("余额不足");
        }
        user.setBalance(balance.subtract(amount));
        return updateById(user);
    }

    @Override
    @Transactional
    public boolean addBalance(Long userId, BigDecimal amount) {
        User user = getById(userId);
        if (user == null) {
            throw new RuntimeException("用户不存在");
        }
        BigDecimal balance = user.getBalance() != null ? user.getBalance() : BigDecimal.ZERO;
        user.setBalance(balance.add(amount));
        return updateById(user);
    }
}
