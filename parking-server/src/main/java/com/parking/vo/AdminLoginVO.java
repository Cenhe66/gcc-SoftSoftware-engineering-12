package com.parking.vo;

import lombok.Data;

@Data
public class AdminLoginVO {

    private String token;

    private Long userId;

    private String nickname;

    private String avatarUrl;
}
