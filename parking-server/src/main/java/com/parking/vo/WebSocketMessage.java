package com.parking.vo;

import lombok.Data;

@Data
public class WebSocketMessage<T> {

    private String type;

    private T data;
}
