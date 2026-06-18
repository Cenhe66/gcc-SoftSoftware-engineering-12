package com.parking.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.parking.dto.ShareBillCreateDTO;
import com.parking.entity.ShareBill;
import com.parking.entity.ShareRecord;
import com.parking.mapper.ShareBillMapper;
import com.parking.service.ShareBillService;
import com.parking.service.ShareRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ShareBillServiceImpl extends ServiceImpl<ShareBillMapper, ShareBill> implements ShareBillService {

    @Autowired
    private ShareRecordService shareRecordService;

    @Override
    @Transactional
    public ShareBill createBill(ShareBillCreateDTO createDTO) {
        ShareRecord record = shareRecordService.getById(createDTO.getShareRecordId());
        if (record == null) {
            throw new RuntimeException("共享记录不存在");
        }
        if (record.getStatus() != 1) {
            throw new RuntimeException("共享记录未处于共享中状态");
        }
        long minutes = ChronoUnit.MINUTES.between(createDTO.getStartTime(), createDTO.getEndTime());
        if (minutes < 1) minutes = 1;
        BigDecimal durationHours = new BigDecimal(minutes).divide(new BigDecimal(60), 2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (record.getShareType() == 0 && record.getHourlyPrice() != null) {
            int hours = (int) Math.ceil(minutes / 60.0);
            totalAmount = record.getHourlyPrice().multiply(new BigDecimal(hours));
        } else if (record.getShareType() == 1 && record.getMonthlyPrice() != null) {
            totalAmount = record.getMonthlyPrice();
        }
        BigDecimal ownerShare = totalAmount.multiply(new BigDecimal("0.8")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal platformShare = totalAmount.subtract(ownerShare);
        ShareBill bill = new ShareBill();
        bill.setShareRecordId(createDTO.getShareRecordId());
        bill.setOwnerId(record.getOwnerId());
        bill.setRenterId(createDTO.getRenterId());
        bill.setSpaceId(record.getSpaceId());
        bill.setStartTime(createDTO.getStartTime());
        bill.setEndTime(createDTO.getEndTime());
        bill.setDurationHours(durationHours);
        bill.setTotalAmount(totalAmount);
        bill.setOwnerShare(ownerShare);
        bill.setPlatformShare(platformShare);
        bill.setBillDate(LocalDate.now());
        bill.setStatus(0);
        baseMapper.insert(bill);
        return bill;
    }

    @Override
    public List<ShareBill> listByOwnerId(Long ownerId) {
        return baseMapper.selectByOwnerId(ownerId);
    }

    @Override
    public List<ShareBill> listByRenterId(Long renterId) {
        return baseMapper.selectByRenterId(renterId);
    }
}
