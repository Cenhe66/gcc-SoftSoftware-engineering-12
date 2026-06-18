package com.parking.service;

import com.parking.vo.HeatmapVO;

import java.util.List;

public interface HeatmapService {

    List<HeatmapVO> getHeatmapByLotId(Long lotId);
}
