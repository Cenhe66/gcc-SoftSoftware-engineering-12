package com.parking.service.impl;

import com.parking.entity.ParkingSpace;
import com.parking.service.HeatmapService;
import com.parking.service.ParkingSpaceService;
import com.parking.vo.HeatmapVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class HeatmapServiceImpl implements HeatmapService {

    @Autowired
    private ParkingSpaceService parkingSpaceService;

    @Override
    public List<HeatmapVO> getHeatmapByLotId(Long lotId) {
        List<ParkingSpace> spaceList = parkingSpaceService.listByLotId(lotId);
        List<HeatmapVO> result = new ArrayList<>();
        for (ParkingSpace space : spaceList) {
            HeatmapVO vo = new HeatmapVO();
            vo.setSpaceId(space.getId());
            vo.setSpaceNo(space.getSpaceNo());
            vo.setCoordX(space.getCoordX());
            vo.setCoordY(space.getCoordY());
            vo.setStatus(space.getStatus());
            vo.setIntensity(calcIntensity(space.getStatus()));
            result.add(vo);
        }
        return result;
    }

    private int calcIntensity(Integer status) {
        if (status == null) return 0;
        switch (status) {
            case 0:
                return 0;
            case 1:
                return 100;
            case 2:
                return 60;
            case 3:
                return 40;
            case 4:
                return 20;
            default:
                return 0;
        }
    }
}
