package com.parking.service.impl;

import com.parking.entity.ParkingSpace;
import com.parking.service.NavigationService;
import com.parking.service.ParkingSpaceService;
import com.parking.vo.NavigationVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class NavigationServiceImpl implements NavigationService {

    @Autowired
    private ParkingSpaceService parkingSpaceService;

    @Override
    public NavigationVO navigateToSpace(Long spaceId, BigDecimal currentX, BigDecimal currentY) {
        ParkingSpace space = parkingSpaceService.getById(spaceId);
        if (space == null) {
            throw new RuntimeException("车位不存在");
        }
        if (space.getCoordX() == null || space.getCoordY() == null) {
            throw new RuntimeException("车位坐标未设置");
        }
        NavigationVO vo = new NavigationVO();
        vo.setSpaceId(space.getId());
        vo.setSpaceNo(space.getSpaceNo());
        vo.setFloor(space.getFloor());
        vo.setArea(space.getArea());
        vo.setTargetX(space.getCoordX());
        vo.setTargetY(space.getCoordY());
        List<NavigationVO.PathPoint> path = calcPath(currentX, currentY, space.getCoordX(), space.getCoordY());
        vo.setPathPoints(path);
        vo.setDistance(calcDistance(currentX, currentY, space.getCoordX(), space.getCoordY()));
        vo.setDirection(calcDirection(currentX, currentY, space.getCoordX(), space.getCoordY()));
        return vo;
    }

    private List<NavigationVO.PathPoint> calcPath(BigDecimal startX, BigDecimal startY, BigDecimal endX, BigDecimal endY) {
        List<NavigationVO.PathPoint> path = new ArrayList<>();
        int steps = 5;
        for (int i = 0; i <= steps; i++) {
            BigDecimal ratio = new BigDecimal(i).divide(new BigDecimal(steps), 4, RoundingMode.HALF_UP);
            BigDecimal x = startX.add(endX.subtract(startX).multiply(ratio));
            BigDecimal y = startY.add(endY.subtract(startY).multiply(ratio));
            NavigationVO.PathPoint point = new NavigationVO.PathPoint();
            point.setX(x);
            point.setY(y);
            path.add(point);
        }
        return path;
    }

    private int calcDistance(BigDecimal x1, BigDecimal y1, BigDecimal x2, BigDecimal y2) {
        double dx = x2.doubleValue() - x1.doubleValue();
        double dy = y2.doubleValue() - y1.doubleValue();
        double dist = Math.sqrt(dx * dx + dy * dy);
        return (int) Math.round(dist);
    }

    private String calcDirection(BigDecimal x1, BigDecimal y1, BigDecimal x2, BigDecimal y2) {
        double dx = x2.doubleValue() - x1.doubleValue();
        double dy = y2.doubleValue() - y1.doubleValue();
        double angle = Math.toDegrees(Math.atan2(dy, dx));
        if (angle >= -22.5 && angle < 22.5) return "东";
        if (angle >= 22.5 && angle < 67.5) return "东北";
        if (angle >= 67.5 && angle < 112.5) return "北";
        if (angle >= 112.5 && angle < 157.5) return "西北";
        if (angle >= 157.5 || angle < -157.5) return "西";
        if (angle >= -157.5 && angle < -112.5) return "西南";
        if (angle >= -112.5 && angle < -67.5) return "南";
        return "东南";
    }
}
