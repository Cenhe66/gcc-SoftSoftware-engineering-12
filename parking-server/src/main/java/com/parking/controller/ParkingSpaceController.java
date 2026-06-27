package com.parking.controller;

import cn.hutool.extra.qrcode.QrCodeUtil;
import cn.hutool.extra.qrcode.QrConfig;
import com.parking.entity.ParkingRecord;
import com.parking.entity.ParkingSpace;
import com.parking.entity.User;
import com.parking.mapper.ParkingRecordMapper;
import com.parking.service.ParkingLotService;
import com.parking.service.ParkingSpaceService;
import com.parking.service.UserService;
import com.parking.vo.Result;
import com.parking.vo.VehicleInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parking-space")
public class ParkingSpaceController {

    @Autowired
    private ParkingSpaceService parkingSpaceService;

    @Autowired
    private ParkingLotService parkingLotService;

    @Autowired
    private ParkingRecordMapper parkingRecordMapper;

    @Autowired
    private UserService userService;

    @GetMapping("/list")
    public Result<List<ParkingSpace>> list(@RequestParam Long lotId) {
        List<ParkingSpace> list = parkingSpaceService.listByLotId(lotId);
        return Result.success(list);
    }

    @GetMapping("/available")
    public Result<List<ParkingSpace>> available(@RequestParam Long lotId) {
        List<ParkingSpace> list = parkingSpaceService.listAvailableByLotId(lotId);
        return Result.success(list);
    }

    @GetMapping("/detail/{id}")
    public Result<ParkingSpace> detail(@PathVariable Long id) {
        ParkingSpace space = parkingSpaceService.getById(id);
        return Result.success(space);
    }

    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody ParkingSpace parkingSpace) {
        boolean success = parkingSpaceService.save(parkingSpace);
        return Result.success(success);
    }

    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody ParkingSpace parkingSpace) {
        boolean success = parkingSpaceService.updateById(parkingSpace);
        return Result.success(success);
    }

    @DeleteMapping("/delete/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean success = parkingSpaceService.removeById(id);
        return Result.success(success);
    }

    @PutMapping("/status/{id}")
    public Result<Boolean> updateStatus(@PathVariable Long id, @RequestParam Integer status) {
        boolean success = parkingSpaceService.updateStatus(id, status);
        return Result.success(success);
    }

    @PutMapping("/lock/{id}")
    public Result<Boolean> updateLockStatus(@PathVariable Long id, @RequestParam Integer lockStatus) {
        boolean success = parkingSpaceService.updateLockStatus(id, lockStatus);
        return Result.success(success);
    }

    @GetMapping("/info")
    public Result<ParkingSpace> info(@RequestParam Long lotId, @RequestParam String spaceCode) {
        ParkingSpace space = parkingSpaceService.getByLotIdAndSpaceNo(lotId, spaceCode);
        if (space == null) {
            return Result.error("未找到该车位信息");
        }
        if (space.getStatus() == null || space.getStatus() != 1) {
            if (space.getStatus() != null && space.getStatus() == 3) {
                return Result.error("该车位为共享车位，无需挪车");
            }
            return Result.error("该车位当前空闲，无需挪车");
        }
        return Result.success(space);
    }

    @GetMapping("/qrcode/{spaceId}")
    public Result<Map<String, String>> generateQrCode(@PathVariable Long spaceId) {
        ParkingSpace space = parkingSpaceService.getById(spaceId);
        if (space == null) {
            throw new RuntimeException("车位不存在");
        }
        String content = String.format("parking://space?id=%d&code=%s", spaceId, space.getSpaceNo());
        QrConfig qrConfig = new QrConfig(300, 300);
        String base64 = QrCodeUtil.generateAsBase64(content, qrConfig, "png");
        Map<String, String> result = new HashMap<>();
        result.put("content", content);
        result.put("base64", base64);
        return Result.success(result);
    }

    @GetMapping("/vehicle")
    public Result<VehicleInfoVO> getVehicleBySpaceId(@RequestParam Long spaceId) {
        ParkingRecord record = parkingRecordMapper.selectOngoingBySpaceId(spaceId);
        if (record == null) {
            return Result.success(null);
        }
        VehicleInfoVO vo = new VehicleInfoVO();
        vo.setPlateNumber(record.getPlateNumber());

        // 填充停车场名称
        if (record.getLotId() != null) {
            com.parking.entity.ParkingLot lot = parkingLotService.getById(record.getLotId());
            if (lot != null) {
                vo.setParkingName(lot.getName());
            }
        }

        if (record.getUserId() != null) {
            User user = userService.getById(record.getUserId());
            if (user != null) {
                // 品牌型号颜色暂从 profileTags 解析（格式：brand|model|color），无则留空
                String tags = user.getProfileTags();
                if (tags != null && tags.contains("|")) {
                    String[] parts = tags.split("\\|");
                    if (parts.length >= 1) vo.setBrand(parts[0]);
                    if (parts.length >= 2) vo.setModel(parts[1]);
                    if (parts.length >= 3) vo.setColor(parts[2]);
                }
            }
        }
        return Result.success(vo);
    }

    @GetMapping("/my")
    public Result<List<ParkingSpace>> mySpaces(javax.servlet.http.HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("currentUserId");
        if (userId == null) {
            return Result.error("未登录");
        }
        List<ParkingSpace> list = parkingSpaceService.listByOwnerId(userId);
        return Result.success(list);
    }
}
