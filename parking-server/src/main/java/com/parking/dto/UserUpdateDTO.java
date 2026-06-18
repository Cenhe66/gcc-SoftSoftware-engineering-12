package com.parking.dto;

import lombok.Data;

@Data
public class UserUpdateDTO {

    private String nickname;

    private String phone;

    private String plateNumber;

    private String profileTags;
}
