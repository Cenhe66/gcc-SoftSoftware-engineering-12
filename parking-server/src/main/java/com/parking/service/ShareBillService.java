package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.ShareBillCreateDTO;
import com.parking.entity.ShareBill;

import java.util.List;

public interface ShareBillService extends IService<ShareBill> {

    ShareBill createBill(ShareBillCreateDTO createDTO);

    List<ShareBill> listByOwnerId(Long ownerId);

    List<ShareBill> listByRenterId(Long renterId);
}
