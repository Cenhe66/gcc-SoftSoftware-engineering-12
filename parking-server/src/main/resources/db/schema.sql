-- 智能停车管理系统数据库建表脚本
-- 数据库: parking_db
-- 字符集: utf8mb4

CREATE DATABASE IF NOT EXISTS parking_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE parking_db;

-- ============================================
-- 1. 用户表
-- ============================================
CREATE TABLE IF NOT EXISTS `user` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `openid`          VARCHAR(64)  NOT NULL UNIQUE COMMENT '微信openid',
    `unionid`         VARCHAR(64)  DEFAULT NULL COMMENT '微信unionid',
    `nickname`        VARCHAR(64)  DEFAULT NULL COMMENT '昵称',
    `avatar_url`      VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `phone`           VARCHAR(20)  DEFAULT NULL COMMENT '手机号',
    `plate_number`    VARCHAR(20)  DEFAULT NULL COMMENT '绑定车牌号',
    `user_type`       TINYINT      DEFAULT 0 COMMENT '用户类型: 0-普通用户 1-业主 2-管理员',
    `profile_tags`    VARCHAR(255) DEFAULT NULL COMMENT '画像标签(JSON): 常用楼层、近电梯偏好等',
    `balance`         DECIMAL(10,2) DEFAULT 0.00 COMMENT '钱包余额(元)',
    `status`          TINYINT      DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除: 0-未删除 1-已删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_openid` (`openid`),
    INDEX `idx_phone` (`phone`),
    INDEX `idx_plate_number` (`plate_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- ============================================
-- 2. 停车场表
-- ============================================
CREATE TABLE IF NOT EXISTS `parking_lot` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `name`            VARCHAR(100) NOT NULL COMMENT '停车场名称',
    `address`         VARCHAR(255) DEFAULT NULL COMMENT '地址',
    `total_spaces`    INT          NOT NULL DEFAULT 0 COMMENT '总车位数',
    `available_spaces` INT         NOT NULL DEFAULT 0 COMMENT '可用车位数',
    `hourly_rate`     DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '每小时费率(元)',
    `daily_cap`       DECIMAL(10,2) DEFAULT NULL COMMENT '每日封顶费用(元)',
    `free_minutes`    INT          DEFAULT 15 COMMENT '免费时长(分钟)',
    `status`          TINYINT      DEFAULT 1 COMMENT '状态: 0-关闭 1-开放',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='停车场表';

-- ============================================
-- 3. 车位表
-- ============================================
CREATE TABLE IF NOT EXISTS `parking_space` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `lot_id`          BIGINT       NOT NULL COMMENT '所属停车场ID',
    `space_no`        VARCHAR(20)  NOT NULL COMMENT '车位编号',
    `floor`           VARCHAR(10)  DEFAULT NULL COMMENT '楼层',
    `area`            VARCHAR(50)  DEFAULT NULL COMMENT '区域',
    `space_type`      TINYINT      DEFAULT 0 COMMENT '车位类型: 0-普通 1-宽大型 2-近电梯 3-充电车位',
    `status`          TINYINT      DEFAULT 0 COMMENT '状态: 0-空闲 1-占用 2-预约中 3-共享中 4-即将空出',
    `lock_status`     TINYINT      DEFAULT 0 COMMENT '地锁状态: 0-降下 1-升起',
    `coord_x`         DECIMAL(10,2) DEFAULT NULL COMMENT '坐标X(用于热力图/AR寻车)',
    `coord_y`         DECIMAL(10,2) DEFAULT NULL COMMENT '坐标Y',
    `owner_id`        BIGINT       DEFAULT NULL COMMENT '业主用户ID(私有车位)',
    `is_shared`       TINYINT      DEFAULT 0 COMMENT '是否可共享: 0-否 1-是',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY `uk_lot_space_no` (`lot_id`, `space_no`),
    INDEX `idx_lot_id` (`lot_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车位表';

-- ============================================
-- 4. 停车记录表
-- ============================================
CREATE TABLE IF NOT EXISTS `parking_record` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `user_id`         BIGINT       NOT NULL COMMENT '用户ID',
    `lot_id`          BIGINT       NOT NULL COMMENT '停车场ID',
    `space_id`        BIGINT       DEFAULT NULL COMMENT '车位ID',
    `plate_number`    VARCHAR(20)  NOT NULL COMMENT '车牌号',
    `entry_time`      DATETIME     NOT NULL COMMENT '入场时间',
    `exit_time`       DATETIME     DEFAULT NULL COMMENT '离场时间',
    `duration_minutes` INT         DEFAULT NULL COMMENT '停车时长(分钟)',
    `fee`             DECIMAL(10,2) DEFAULT 0.00 COMMENT '应付费用',
    `paid_amount`     DECIMAL(10,2) DEFAULT 0.00 COMMENT '实付金额',
    `pay_status`      TINYINT      DEFAULT 0 COMMENT '支付状态: 0-未支付 1-已支付 2-免密扣款中',
    `record_status`   TINYINT      DEFAULT 0 COMMENT '记录状态: 0-进行中 1-已完成 2-异常',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_plate_number` (`plate_number`),
    INDEX `idx_entry_time` (`entry_time`),
    INDEX `idx_record_status` (`record_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='停车记录表';

-- ============================================
-- 5. 预约订单表
-- ============================================
CREATE TABLE IF NOT EXISTS `reservation` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `user_id`         BIGINT       NOT NULL COMMENT '用户ID',
    `lot_id`          BIGINT       NOT NULL COMMENT '停车场ID',
    `space_id`        BIGINT       NOT NULL COMMENT '车位ID',
    `plate_number`    VARCHAR(20)  NOT NULL COMMENT '车牌号',
    `start_time`      DATETIME     NOT NULL COMMENT '预约开始时间',
    `end_time`        DATETIME     NOT NULL COMMENT '预约结束时间',
    `reserve_fee`     DECIMAL(10,2) DEFAULT 0.00 COMMENT '预约费用',
    `parking_fee`     DECIMAL(10,2) DEFAULT NULL COMMENT '实际停车费',
    `status`          TINYINT      DEFAULT 0 COMMENT '状态: 0-待使用 1-使用中 2-已完成 3-已取消 4-待支付 5-已过期',
    `entry_time`      DATETIME     DEFAULT NULL COMMENT '实际入场时间',
    `exit_time`       DATETIME     DEFAULT NULL COMMENT '实际离场时间',
    `cancel_time`     DATETIME     DEFAULT NULL COMMENT '取消时间',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_space_id` (`space_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_start_time` (`start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约订单表';

-- ============================================
-- 6. 共享车位记录表
-- ============================================
CREATE TABLE IF NOT EXISTS `share_record` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `space_id`        BIGINT       NOT NULL COMMENT '车位ID',
    `owner_id`        BIGINT       NOT NULL COMMENT '业主用户ID',
    `share_type`      TINYINT      DEFAULT 0 COMMENT '共享类型: 0-按时共享 1-包月共享',
    `start_time`      DATETIME     NOT NULL COMMENT '共享开始时间',
    `end_time`        DATETIME     NOT NULL COMMENT '共享结束时间',
    `hourly_price`    DECIMAL(10,2) DEFAULT NULL COMMENT '按时单价(元/小时)',
    `monthly_price`   DECIMAL(10,2) DEFAULT NULL COMMENT '包月价格(元/月)',
    `status`          TINYINT      DEFAULT 0 COMMENT '状态: 0-待审核 1-共享中 2-已暂停 3-已结束',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_space_id` (`space_id`),
    INDEX `idx_owner_id` (`owner_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='共享车位记录表';

-- ============================================
-- 7. 共享分账账单表
-- ============================================
CREATE TABLE IF NOT EXISTS `share_bill` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `share_record_id` BIGINT       NOT NULL COMMENT '共享记录ID',
    `owner_id`        BIGINT       NOT NULL COMMENT '业主用户ID',
    `renter_id`       BIGINT       NOT NULL COMMENT '租户用户ID',
    `space_id`        BIGINT       NOT NULL COMMENT '车位ID',
    `start_time`      DATETIME     NOT NULL COMMENT '使用开始时间',
    `end_time`        DATETIME     NOT NULL COMMENT '使用结束时间',
    `duration_hours`  DECIMAL(10,2) DEFAULT 0.00 COMMENT '使用时长(小时)',
    `total_amount`    DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '总金额',
    `owner_share`     DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '业主分成',
    `platform_share`  DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '平台分成',
    `bill_date`       DATE         NOT NULL COMMENT '账单日期',
    `status`          TINYINT      DEFAULT 0 COMMENT '状态: 0-待结算 1-已结算',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_owner_id` (`owner_id`),
    INDEX `idx_renter_id` (`renter_id`),
    INDEX `idx_bill_date` (`bill_date`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='共享分账账单表';

-- ============================================
-- 8. 挪车请求表
-- ============================================
CREATE TABLE IF NOT EXISTS `move_car_request` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `requester_id`    BIGINT       NOT NULL COMMENT '请求人用户ID',
    `target_plate`    VARCHAR(20)  NOT NULL COMMENT '目标车辆车牌号',
    `target_space_id` BIGINT       DEFAULT NULL COMMENT '目标车位ID',
    `target_user_id`  BIGINT       DEFAULT NULL COMMENT '目标车主用户ID',
    `reason`          VARCHAR(255) DEFAULT NULL COMMENT '挪车原因',
    `status`          TINYINT      DEFAULT 0 COMMENT '状态: 0-待处理 1-已通知 2-已处理 3-已取消',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_requester_id` (`requester_id`),
    INDEX `idx_target_plate` (`target_plate`),
    INDEX `idx_target_user_id` (`target_user_id`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='挪车请求表';

-- ============================================
-- 9. 挪车消息表
-- ============================================
CREATE TABLE IF NOT EXISTS `move_car_message` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `request_id`      BIGINT       NOT NULL COMMENT '挪车请求ID',
    `sender_id`       BIGINT       NOT NULL COMMENT '发送者用户ID',
    `receiver_id`     BIGINT       NOT NULL COMMENT '接收者用户ID',
    `msg_type`        TINYINT      DEFAULT 0 COMMENT '消息类型: 0-文字 1-语音 2-快捷模板',
    `content`         TEXT         DEFAULT NULL COMMENT '消息内容',
    `template_code`   VARCHAR(50)  DEFAULT NULL COMMENT '快捷模板编码',
    `is_read`         TINYINT      DEFAULT 0 COMMENT '是否已读: 0-未读 1-已读',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_request_id` (`request_id`),
    INDEX `idx_receiver_id` (`receiver_id`),
    INDEX `idx_is_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='挪车消息表';

-- ============================================
-- 10. 访客授权表
-- ============================================
CREATE TABLE IF NOT EXISTS `visitor_auth` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `host_id`         BIGINT       NOT NULL COMMENT '业主/商户用户ID',
    `lot_id`          BIGINT       NOT NULL COMMENT '停车场ID',
    `visitor_plate`   VARCHAR(20)  NOT NULL COMMENT '访客车牌号',
    `auth_code`       VARCHAR(32)  NOT NULL COMMENT '授权码',
    `max_uses`        INT          DEFAULT 1 COMMENT '最大使用次数',
    `used_count`      INT          DEFAULT 0 COMMENT '已使用次数',
    `valid_start`     DATETIME     NOT NULL COMMENT '有效开始时间',
    `valid_end`       DATETIME     NOT NULL COMMENT '有效结束时间',
    `fee_type`        TINYINT      DEFAULT 0 COMMENT '计费方式: 0-访客自付 1-业主代付',
    `status`          TINYINT      DEFAULT 0 COMMENT '状态: 0-有效 1-已用完 2-已过期 3-已撤销',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_host_id` (`host_id`),
    INDEX `idx_auth_code` (`auth_code`),
    INDEX `idx_visitor_plate` (`visitor_plate`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='访客授权表';

-- ============================================
-- 11. 车辆健康检测日志表
-- ============================================
CREATE TABLE IF NOT EXISTS `health_check_log` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `record_id`       BIGINT       NOT NULL COMMENT '停车记录ID',
    `user_id`         BIGINT       NOT NULL COMMENT '用户ID',
    `plate_number`    VARCHAR(20)  NOT NULL COMMENT '车牌号',
    `check_type`      TINYINT      NOT NULL COMMENT '检测类型: 1-车窗未关 2-车灯常亮 3-胎压异常',
    `check_result`    TINYINT      DEFAULT 0 COMMENT '检测结果: 0-正常 1-异常',
    `description`     VARCHAR(255) DEFAULT NULL COMMENT '异常描述',
    `image_url`       VARCHAR(255) DEFAULT NULL COMMENT '检测图片URL(模拟)',
    `is_notified`     TINYINT      DEFAULT 0 COMMENT '是否已通知: 0-未通知 1-已通知',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX `idx_record_id` (`record_id`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_plate_number` (`plate_number`),
    INDEX `idx_check_result` (`check_result`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='车辆健康检测日志表';

-- ============================================
-- 12. 支付订单表
-- ============================================
CREATE TABLE IF NOT EXISTS `payment_order` (
    `id`              BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    `order_no`        VARCHAR(64)  NOT NULL UNIQUE COMMENT '订单编号',
    `user_id`         BIGINT       NOT NULL COMMENT '用户ID',
    `biz_type`        TINYINT      NOT NULL COMMENT '业务类型: 1-停车费 2-预约费 3-共享费 4-超时罚金',
    `biz_id`          BIGINT       NOT NULL COMMENT '业务ID(关联停车记录/预约/共享等)',
    `amount`          DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '订单金额',
    `pay_channel`     TINYINT      DEFAULT 1 COMMENT '支付渠道: 1-微信支付 2-余额',
    `pay_status`      TINYINT      DEFAULT 0 COMMENT '支付状态: 0-待支付 1-支付中 2-支付成功 3-支付失败 4-已退款',
    `transaction_id`  VARCHAR(64)  DEFAULT NULL COMMENT '第三方支付流水号',
    `pay_time`        DATETIME     DEFAULT NULL COMMENT '支付时间',
    `deleted`         TINYINT      DEFAULT 0 COMMENT '逻辑删除',
    `create_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_order_no` (`order_no`),
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_biz_type` (`biz_type`),
    INDEX `idx_pay_status` (`pay_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付订单表';
