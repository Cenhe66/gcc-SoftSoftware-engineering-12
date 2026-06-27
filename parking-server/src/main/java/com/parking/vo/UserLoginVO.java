package com.parking.vo;

import lombok.Data;

@Data
public class UserLoginVO {

    private String token;

    private Long userId;

    private String nickname;

    private String avatarUrl;

    private Integer userType;
}
