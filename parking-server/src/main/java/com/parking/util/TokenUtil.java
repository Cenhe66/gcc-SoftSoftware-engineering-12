package com.parking.util;

import cn.hutool.core.date.DateUtil;
import cn.hutool.crypto.digest.DigestUtil;
import cn.hutool.jwt.JWT;
import cn.hutool.jwt.JWTPayload;
import cn.hutool.jwt.JWTUtil;

import java.util.Date;

public class TokenUtil {

    // 简单的密钥，生产环境应放在配置中心
    private static final String SECRET_KEY = "parking-admin-secret-key-2026";

    // token 有效期：7天
    private static final long EXPIRE_DAYS = 7;

    public static String generateToken(Long userId) {
        Date now = new Date();
        Date expire = DateUtil.offsetDay(now, (int) EXPIRE_DAYS);
        return JWT.create()
                .setPayload("userId", userId)
                .setPayload(JWTPayload.ISSUED_AT, now)
                .setPayload(JWTPayload.EXPIRES_AT, expire)
                .setKey(SECRET_KEY.getBytes())
                .sign();
    }

    public static Long parseUserId(String token) {
        if (token == null || token.isEmpty()) {
            return null;
        }
        try {
            JWT jwt = JWTUtil.parseToken(token);
            boolean verify = jwt.setKey(SECRET_KEY.getBytes()).verify();
            if (!verify) {
                return null;
            }
            Object userId = jwt.getPayload("userId");
            return userId != null ? Long.valueOf(userId.toString()) : null;
        } catch (Exception e) {
            return null;
        }
    }

    public static String md5Password(String password) {
        return DigestUtil.md5Hex(password);
    }
}
