package com.parking.websocket;

import com.alibaba.fastjson2.JSON;
import com.parking.vo.WebSocketMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class ParkingWebSocketHandler extends TextWebSocketHandler {

    private static final Map<String, WebSocketSession> SESSION_MAP = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String sessionId = session.getId();
        SESSION_MAP.put(sessionId, session);
        log.info("WebSocket连接建立: {}, 当前连接数: {}", sessionId, SESSION_MAP.size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        String payload = message.getPayload();
        log.info("收到WebSocket消息: {}", payload);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = session.getId();
        SESSION_MAP.remove(sessionId);
        log.info("WebSocket连接关闭: {}, 当前连接数: {}", sessionId, SESSION_MAP.size());
    }

    public void broadcast(Object data) {
        if (SESSION_MAP.isEmpty()) {
            return;
        }
        WebSocketMessage<Object> message = new WebSocketMessage<>();
        message.setType("broadcast");
        message.setData(data);
        String json = JSON.toJSONString(message);
        TextMessage textMessage = new TextMessage(json);
        for (WebSocketSession session : SESSION_MAP.values()) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(textMessage);
                } catch (IOException e) {
                    log.error("WebSocket广播发送失败: {}", e.getMessage());
                }
            }
        }
    }

    public void sendToSession(String sessionId, Object data) {
        WebSocketSession session = SESSION_MAP.get(sessionId);
        if (session == null || !session.isOpen()) {
            return;
        }
        WebSocketMessage<Object> message = new WebSocketMessage<>();
        message.setType("push");
        message.setData(data);
        String json = JSON.toJSONString(message);
        try {
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            log.error("WebSocket单发失败: {}", e.getMessage());
        }
    }

    public int getOnlineCount() {
        return SESSION_MAP.size();
    }
}
