package com.parking.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class HeatmapVO {

    private Long spaceId;

    private String spaceNo;

    private BigDecimal coordX;

    private BigDecimal coordY;

    private Integer status;

    private Integer intensity;
}
