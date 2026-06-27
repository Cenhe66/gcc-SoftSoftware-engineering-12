-- 管理员相关字段迁移
-- 给用户表增加管理员登录字段

ALTER TABLE `user`
    ADD COLUMN `username` VARCHAR(64) DEFAULT NULL COMMENT '管理员登录账号' AFTER `id`,
    ADD COLUMN `password` VARCHAR(128) DEFAULT NULL COMMENT '管理员登录密码' AFTER `username`,
    ADD UNIQUE INDEX `uk_username` (`username`);

-- 插入默认管理员账号（密码明文为 admin123，生产环境应使用加密后的密码）
-- 这里使用 Hutool 的 MD5: DigestUtil.md5Hex("admin123") = 0192023a7bbd73250516f069df18b500
INSERT INTO `user` (`username`, `password`, `nickname`, `phone`, `user_type`, `status`, `balance`)
VALUES ('admin', '0192023a7bbd73250516f069df18b500', '系统管理员', '13800138000', 2, 1, 0.00)
ON DUPLICATE KEY UPDATE `username` = `username`;
