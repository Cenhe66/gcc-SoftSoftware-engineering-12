package com.parking.task;

import com.parking.service.ShareRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ShareRecordExpireTask {

    @Autowired
    private ShareRecordService shareRecordService;

    /**
     * 自动结束到期的共享记录（每5分钟执行）
     * 共享结束时间已过，但状态仍为共享中(1)的记录，标记为已结束(3)
     */
    @Scheduled(cron = "0 */5 * * * ?")
    public void autoExpire() {
        log.info("开始执行共享记录到期自动结束定时任务");
        shareRecordService.autoExpire();
        log.info("共享记录到期自动结束定时任务执行完成");
    }
}
