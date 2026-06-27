-- 预约表新增字段迁移脚本
-- 执行时间: 2026-06-23
-- 说明: 添加 parking_fee 和 exit_time 字段，更新状态定义

USE parking_db;

-- 添加 parking_fee 字段
ALTER TABLE `reservation` 
ADD COLUMN `parking_fee` DECIMAL(10,2) DEFAULT NULL COMMENT '实际停车费' AFTER `reserve_fee`;

-- 添加 exit_time 字段
ALTER TABLE `reservation` 
ADD COLUMN `exit_time` DATETIME DEFAULT NULL COMMENT '实际离场时间' AFTER `entry_time`;

-- 更新状态字段注释
ALTER TABLE `reservation` 
MODIFY COLUMN `status` TINYINT DEFAULT 0 COMMENT '状态: 0-待使用 1-使用中 2-已完成 3-已取消 4-待支付 5-已过期';

-- 验证修改
DESCRIBE `reservation`;