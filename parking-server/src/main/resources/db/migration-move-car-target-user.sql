-- 挪车请求表新增 target_user_id 字段
-- 执行时间: 2026-06-24
-- 说明: 记录目标车主用户ID，用于消息发送时确定 receiverId

USE parking_db;

ALTER TABLE `move_car_request`
ADD COLUMN `target_user_id` BIGINT DEFAULT NULL COMMENT '目标车主用户ID' AFTER `target_space_id`,
ADD INDEX `idx_target_user_id` (`target_user_id`);

-- 验证修改
DESCRIBE `move_car_request`;
