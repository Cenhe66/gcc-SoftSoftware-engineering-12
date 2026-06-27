-- 共享记录表 owner_id 默认值修复
-- 执行时间: 2026-06-24
-- 说明: share_record 表的 owner_id 设置默认值，避免空值插入报错

USE parking_db;

ALTER TABLE `share_record`
MODIFY COLUMN `owner_id` BIGINT NOT NULL DEFAULT 1 COMMENT '业主用户ID';

-- 验证修改
DESCRIBE `share_record`;
