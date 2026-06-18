package com.parking.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class NavigationVO {

    private Long spaceId;

    private String spaceNo;

    private String floor;

    private String area;

    private BigDecimal targetX;

    private BigDecimal targetY;

    private List<PathPoint> pathPoints;

    private Integer distance;

    private String direction;

    @Data
    public static class PathPoint {
        private BigDecimal x;
        private BigDecimal y;
    }
}
