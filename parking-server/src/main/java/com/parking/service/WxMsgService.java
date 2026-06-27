package com.parking.service;

import com.parking.config.WxConfigProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class WxMsgService {

    @Autowired
    private WxConfigProperties wxConfig;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String ACCESS_TOKEN_KEY = "wx:access_token";

    public String getAccessToken() {
        String token = redisTemplate.opsForValue().get(ACCESS_TOKEN_KEY);
        if (token != null) {
            return token;
        }
        String url = String.format(
                "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s",
                wxConfig.getAppId(), wxConfig.getAppSecret()
        );
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map body = response.getBody();
            if (body != null && body.get("access_token") != null) {
                token = (String) body.get("access_token");
                Long expiresIn = ((Number) body.get("expires_in")).longValue();
                redisTemplate.opsForValue().set(ACCESS_TOKEN_KEY, token, expiresIn - 200, TimeUnit.SECONDS);
                return token;
            }
        } catch (Exception e) {
            log.error("获取微信access_token失败: {}", e.getMessage());
        }
        return null;
    }

    public boolean sendMoveCarMsg(String openid, String plateNumber, String parkingName, String spaceCode, String reason) {
        String accessToken = getAccessToken();
        if (accessToken == null) {
            log.warn("微信access_token为空，无法发送订阅消息");
            return false;
        }

        String url = "https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=" + accessToken;

        Map<String, Object> data = new HashMap<>();
        data.put("touser", openid);
        data.put("template_id", wxConfig.getMoveCarTemplateId());
        data.put("page", "/pages/move-car-message/move-car-message");
        data.put("miniprogram_state", "developer");
        data.put("lang", "zh_CN");

        Map<String, Map<String, String>> msgData = new HashMap<>();
        msgData.put("thing1", wrapData(plateNumber));
        msgData.put("thing2", wrapData(parkingName + " " + spaceCode));
        msgData.put("thing3", wrapData(reason));
        data.put("data", msgData);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, data, Map.class);
            Map body = response.getBody();
            if (body != null && Integer.valueOf(0).equals(body.get("errcode"))) {
                log.info("挪车订阅消息发送成功, openid={}", openid);
                return true;
            } else {
                log.error("挪车订阅消息发送失败: {}", body);
            }
        } catch (Exception e) {
            log.error("发送挪车订阅消息异常: {}", e.getMessage());
        }
        return false;
    }

    private Map<String, String> wrapData(String value) {
        Map<String, String> map = new HashMap<>();
        map.put("value", value.length() > 20 ? value.substring(0, 20) : value);
        return map;
    }
}
