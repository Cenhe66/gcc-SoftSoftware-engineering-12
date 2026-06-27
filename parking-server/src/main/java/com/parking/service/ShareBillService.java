package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.ShareBillCreateDTO;
import com.parking.entity.ShareBill;
import com.parking.vo.ShareBillVO;
import com.parking.vo.ShareBillStatsVO;

import java.util.List;

public interface ShareBillService extends IService<ShareBill> {

    ShareBill createBill(ShareBillCreateDTO createDTO);

    ShareBillStatsVO getStats();

    List<ShareBillVO> listVO(Long ownerId, Long renterId, Integer pageNum, Integer pageSize);

    List<ShareBill> listByOwnerId(Long ownerId);

    List<ShareBill> listByRenterId(Long renterId);
}
