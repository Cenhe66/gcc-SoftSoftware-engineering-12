package com.parking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.parking.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    @Select("SELECT * FROM user WHERE openid = #{openid} AND deleted = 0 LIMIT 1")
    User selectByOpenid(@Param("openid") String openid);

    @Select("SELECT * FROM user WHERE phone = #{phone} AND deleted = 0 LIMIT 1")
    User selectByPhone(@Param("phone") String phone);

    @Select("SELECT * FROM user WHERE username = #{username} AND deleted = 0 LIMIT 1")
    User selectByUsername(@Param("username") String username);
}
