package com.parking.task;

import com.parking.service.ReservationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ReservationReleaseTask {

    @Autowired
    private ReservationService reservationService;

    @Scheduled(cron = "0 */5 * * * ?")
    public void releaseExpired() {
        log.info("开始执行预约超时释放定时任务");
        reservationService.releaseExpiredReservations();
        log.info("预约超时释放定时任务执行完成");
    }
}
