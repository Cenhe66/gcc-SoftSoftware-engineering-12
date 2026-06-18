package com.parking.service.impl;

import com.parking.service.HeatmapService;
import com.parking.service.ParkingWebSocketService;
import com.parking.vo.HeatmapVO;
import com.parking.websocket.ParkingWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ParkingWebSocketServiceImpl implements ParkingWebSocketService {

    @Autowired
    private ParkingWebSocketHandler webSocketHandler;

    @Autowired
    private HeatmapService heatmapService;

    @Override
    public void broadcastSpaceStatusChange(Long lotId, Long spaceId, Integer newStatus) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("event", "space_status_change");
        payload.put("lotId", lotId);
        payload.put("spaceId", spaceId);
        payload.put("newStatus", newStatus);
        webSocketHandler.broadcast(payload);
    }

    @Override
    public void broadcastHeatmapUpdate(Long lotId) {
        List<HeatmapVO> heatmapData = heatmapService.getHeatmapByLotId(lotId);
        Map<String, Object> payload = new HashMap<>();
        payload.put("event", "heatmap_update");
        payload.put("lotId", lotId);
        payload.put("data", heatmapData);
        webSocketHandler.broadcast(payload);
    }

    @Override
    public int getOnlineCount() {
        return webSocketHandler.getOnlineCount();
    }
}
