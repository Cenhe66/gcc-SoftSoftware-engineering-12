package com.parking.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.parking.dto.LoginDTO;
import com.parking.dto.UserUpdateDTO;
import com.parking.entity.ShareBill;
import com.parking.entity.User;
import com.parking.mapper.ParkingRecordMapper;
import com.parking.mapper.ReservationMapper;
import com.parking.mapper.ShareBillMapper;
import com.parking.mapper.ShareRecordMapper;
import com.parking.service.UserService;
import com.parking.util.TokenUtil;
import com.parking.vo.Result;
import com.parking.vo.UserLoginVO;
import com.parking.vo.UserStatsVO;
import org.springframework.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private ParkingRecordMapper parkingRecordMapper;

    @Autowired
    private ReservationMapper reservationMapper;

    @Autowired
    private ShareRecordMapper shareRecordMapper;

    @Autowired
    private ShareBillMapper shareBillMapper;

    @PostMapping("/login")
    public Result<UserLoginVO> login(@RequestBody LoginDTO loginDTO) {
        User user = userService.wxLogin(loginDTO);
        if (user == null) {
            return Result.error("登录失败");
        }
        String token = TokenUtil.generateToken(user.getId());
        UserLoginVO vo = new UserLoginVO();
        vo.setToken(token);
        vo.setUserId(user.getId());
        vo.setNickname(user.getNickname());
        vo.setAvatarUrl(user.getAvatarUrl());
        vo.setUserType(user.getUserType());
        return Result.success(vo);
    }

    @GetMapping("/list")
    public Result<IPage<User>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword) {
        Page<User> pageParam = new Page<>(page, size);
        QueryWrapper<User> wrapper = new QueryWrapper<>();
        wrapper.eq("deleted", 0);
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.and(w -> w.like("nickname", keyword)
                    .or()
                    .like("phone", keyword)
                    .or()
                    .like("username", keyword));
        }
        wrapper.orderByDesc("create_time");
        IPage<User> result = userService.page(pageParam, wrapper);
        return Result.success(result);
    }

    @GetMapping("/info/{id}")
    public Result<User> getUserInfo(@PathVariable Long id) {
        User user = userService.getById(id);
        return Result.success(user);
    }

    @GetMapping("/current")
    public Result<User> getCurrentUser(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("currentUserId");
        User user = userService.getById(userId);
        return Result.success(user);
    }

    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody User user) {
        if (!StringUtils.hasText(user.getOpenid())) {
            user.setOpenid("admin_" + System.currentTimeMillis());
        }
        if (user.getStatus() == null) {
            user.setStatus(1);
        }
        if (user.getUserType() == null) {
            user.setUserType(0);
        }
        if (user.getBalance() == null) {
            user.setBalance(BigDecimal.ZERO);
        }
        if (StringUtils.hasText(user.getPassword())) {
            user.setPassword(TokenUtil.md5Password(user.getPassword()));
        }
        boolean success = userService.save(user);
        return Result.success(success);
    }

    @PutMapping("/update/{id}")
    public Result<Boolean> updateUserInfo(@PathVariable Long id, @RequestBody UserUpdateDTO updateDTO) {
        boolean success = userService.updateUserInfo(id, updateDTO);
        return Result.success(success);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean success = userService.removeById(id);
        return Result.success(success);
    }

    @GetMapping("/stats/{userId}")
    public Result<UserStatsVO> getUserStats(@PathVariable Long userId) {
        UserStatsVO stats = new UserStatsVO();

        // 停车次数
        int parkingCount = parkingRecordMapper.selectByUserId(userId).size();
        stats.setParkingCount(parkingCount);

        // 预约次数
        int reservationCount = reservationMapper.selectByUserId(userId).size();
        stats.setReservationCount(reservationCount);

        // 共享次数
        int shareCount = shareRecordMapper.countByOwnerId(userId);
        stats.setShareCount(shareCount);

        // 共享收益
        List<ShareBill> bills = shareBillMapper.selectByOwnerId(userId);
        BigDecimal totalEarnings = bills.stream()
                .map(ShareBill::getOwnerShare)
                .filter(share -> share != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.setTotalEarnings(totalEarnings);

        return Result.success(stats);
    }
}
