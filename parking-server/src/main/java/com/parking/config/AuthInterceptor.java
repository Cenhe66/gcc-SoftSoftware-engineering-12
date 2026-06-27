package com.parking.config;

import com.parking.entity.User;
import com.parking.service.UserService;
import com.parking.util.TokenUtil;
import com.parking.vo.Result;
import com.alibaba.fastjson2.JSON;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.PrintWriter;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Autowired
    private UserService userService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 放行登录接口
        String uri = request.getRequestURI();
        if (uri.startsWith("/api/admin/login") || uri.startsWith("/api/user/login")) {
            return true;
        }

        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // 没有 token 的请求直接放行（兼容小程序等未接入 token 的客户端）
        if (token == null || token.isEmpty()) {
            return true;
        }

        Long userId = TokenUtil.parseUserId(token);
        if (userId == null) {
            writeError(response, 401, "登录已过期，请重新登录");
            return false;
        }

        User user = userService.getById(userId);
        if (user == null || user.getStatus() == null || user.getStatus() == 0) {
            writeError(response, 401, "用户不存在或已被禁用");
            return false;
        }

        // 将 userId 放入 request 属性，方便后续使用
        request.setAttribute("currentUserId", userId);
        return true;
    }

    private void writeError(HttpServletResponse response, int code, String message) throws Exception {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(200);
        PrintWriter writer = response.getWriter();
        writer.write(JSON.toJSONString(Result.error(code, message)));
        writer.flush();
        writer.close();
    }
}
