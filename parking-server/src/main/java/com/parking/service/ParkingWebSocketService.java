package com.parking.service;

public interface ParkingWebSocketService {

    void broadcastSpaceStatusChange(Long lotId, Long spaceId, Integer newStatus);

    void broadcastHeatmapUpdate(Long lotId);

    int getOnlineCount();
}
