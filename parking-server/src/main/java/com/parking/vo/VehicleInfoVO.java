package com.parking.vo;

import lombok.Data;

/**
 * 车辆信息视图对象
 */
@Data
public class VehicleInfoVO {
    private String plateNumber;
    private String brand;
    private String model;
    private String color;
    private String parkingName;
}
