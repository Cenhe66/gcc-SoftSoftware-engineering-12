package com.parking.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.parking.dto.ShareRecordCreateDTO;
import com.parking.entity.ShareRecord;
import com.parking.vo.ShareRecordVO;
import com.parking.vo.ShareStatsVO;

import java.util.List;

public interface ShareRecordService extends IService<ShareRecord> {

    ShareRecord create(ShareRecordCreateDTO createDTO);

    boolean pause(Long id);

    boolean resume(Long id);

    boolean stop(Long id);

    ShareStatsVO getStats(Long ownerId);

    List<ShareRecordVO> listVO(Long ownerId, String status, Integer pageNum, Integer pageSize);

    List<ShareRecord> listByOwnerId(Long ownerId);

    /**
     * 查询车位当前活跃的共享记录（共享中）
     */
    List<ShareRecord> selectActiveBySpaceId(Long spaceId);

    /**
     * 查询车位待停止的共享记录
     */
    ShareRecord selectPendingStopBySpaceId(Long spaceId);

    void autoExpire();

    /**
     * 尝试完成待停止的共享记录（离场/取消后自动触发）
     */
    void tryCompletePendingStop(Long spaceId);
}
