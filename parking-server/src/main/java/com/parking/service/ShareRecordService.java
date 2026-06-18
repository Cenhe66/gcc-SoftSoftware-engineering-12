package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.ShareRecordCreateDTO;
import com.parking.entity.ShareRecord;

import java.util.List;

public interface ShareRecordService extends IService<ShareRecord> {

    ShareRecord create(ShareRecordCreateDTO createDTO);

    boolean pause(Long id);

    boolean resume(Long id);

    List<ShareRecord> listByOwnerId(Long ownerId);
}
