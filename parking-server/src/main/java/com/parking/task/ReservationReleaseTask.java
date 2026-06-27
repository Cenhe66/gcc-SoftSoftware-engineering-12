package com.parking.task;

import com.parking.entity.Reservation;
import com.parking.service.ReservationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
public class ReservationReleaseTask {

    @Autowired
    private ReservationService reservationService;

    /**
     * 释放超时未入场的预约（每5分钟执行）
     * 预约开始时间已过，但状态仍为待使用(0)的预约，标记为已过期(5)
     */
    @Scheduled(cron = "0 */5 * * * ?")
    public void releaseExpired() {
        log.info("开始执行预约超时释放定时任务");
        reservationService.releaseExpiredReservations();
        log.info("预约超时释放定时任务执行完成");
    }

    /**
     * 取消未支付超时的预约（每1分钟执行）
     * 创建超过1分钟仍未支付预约费的预约，自动取消
     */
    @Scheduled(cron = "0 */1 * * * ?")
    public void cancelUnpaidExpired() {
        log.info("开始执行未支付预约取消定时任务");
        reservationService.cancelUnpaidExpired();
        log.info("未支付预约取消定时任务执行完成");
    }

    /**
     * 预约开始提醒（每5分钟执行）
     * 预约开始时间在30分钟内的待使用预约，发送提醒
     */
    @Scheduled(cron = "0 */5 * * * ?")
    public void remindUpcomingReservation() {
        log.info("开始执行预约开始提醒定时任务");
        // TODO: 实现提醒逻辑（可通过WebSocket推送或短信通知）
        // LocalDateTime now = LocalDateTime.now();
        // LocalDateTime remindTime = now.plusMinutes(30);
        // List<Reservation> upcomingList = reservationService.findUpcoming(now, remindTime);
        // for (Reservation r : upcomingList) {
        //     // 发送提醒通知
        // }
        log.info("预约开始提醒定时任务执行完成");
    }

    /**
     * 预约结束提醒（每5分钟执行）
     * 预约结束时间已到达，但仍在使用中(1)的预约，发送离场提醒
     */
    @Scheduled(cron = "0 */5 * * * ?")
    public void remindEndingReservation() {
        log.info("开始执行预约结束提醒定时任务");
        // TODO: 实现提醒逻辑
        // LocalDateTime now = LocalDateTime.now();
        // List<Reservation> endingList = reservationService.findEnding(now);
        // for (Reservation r : endingList) {
        //     // 发送离场提醒通知
        // }
        log.info("预约结束提醒定时任务执行完成");
    }
}
