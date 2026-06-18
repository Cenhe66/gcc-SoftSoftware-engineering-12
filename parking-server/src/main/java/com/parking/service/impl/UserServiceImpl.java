package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.LoginDTO;
import com.parking.dto.UserUpdateDTO;
import com.parking.entity.User;
import com.parking.mapper.UserMapper;
import com.parking.service.UserService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

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
            baseMapper.insert(user);
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
}
