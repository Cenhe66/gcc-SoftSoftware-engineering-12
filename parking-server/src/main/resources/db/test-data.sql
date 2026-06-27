-- ============================================================
-- 匿名挪车测试数据
-- 使用方法：在数据库中执行此脚本，或直接复制对应 INSERT 执行
-- ============================================================

-- 1. 测试停车场
INSERT INTO `parking_lot` (`id`, `name`, `address`, `total_spaces`, `available_spaces`, `hourly_rate`, `daily_cap`, `free_minutes`, `status`, `deleted`, `create_time`, `update_time`)
VALUES (1, '测试广场停车场', '测试路1号', 100, 99, 5.00, 50.00, 15, 1, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE `name` = '测试广场停车场';

-- 2. 测试车主用户
INSERT INTO `user` (`id`, `openid`, `unionid`, `nickname`, `avatar_url`, `phone`, `plate_number`, `user_type`, `profile_tags`, `status`, `deleted`, `create_time`, `update_time`)
VALUES (1, 'test-openid-001', NULL, '测试车主', NULL, '13800138000', '京A12345', 1, '大众|帕萨特|黑色', 1, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE `nickname` = '测试车主', `plate_number` = '京A12345';

-- 3. 测试车位（绑定到测试停车场，状态=1 占用）
INSERT INTO `parking_space` (`id`, `lot_id`, `space_no`, `floor`, `area`, `space_type`, `status`, `lock_status`, `coord_x`, `coord_y`, `owner_id`, `is_shared`, `deleted`, `create_time`, `update_time`)
VALUES (1, 1, 'B2-015', 'B2', 'A区', 1, 1, 0, NULL, NULL, 1, 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE `lot_id` = 1, `space_no` = 'B2-015', `status` = 1;

-- 3b. 空闲车位（可用于共享车位、预约等测试）
INSERT INTO `parking_space` (`id`, `lot_id`, `space_no`, `floor`, `area`, `space_type`, `status`, `lock_status`, `coord_x`, `coord_y`, `owner_id`, `is_shared`, `deleted`, `create_time`, `update_time`)
VALUES
(2, 1, 'A1-001', 'B1', 'A区', 0, 0, 0, NULL, NULL, 1, 0, 0, NOW(), NOW()),
(3, 1, 'A1-002', 'B1', 'A区', 0, 0, 0, NULL, NULL, 1, 0, 0, NOW(), NOW()),
(4, 1, 'A1-003', 'B1', 'A区', 0, 0, 0, NULL, NULL, 1, 0, 0, NOW(), NOW()),
(5, 1, 'B1-010', 'B1', 'B区', 0, 0, 0, NULL, NULL, 1, 0, 0, NOW(), NOW()),
(6, 1, 'B2-016', 'B2', 'B区', 0, 0, 0, NULL, NULL, 1, 0, 0, NOW(), NOW()),
(7, 1, 'B2-017', 'B2', 'B区', 3, 0, 0, NULL, NULL, 1, 0, 0, NOW(), NOW()),
(8, 1, 'B3-001', 'B3', 'C区', 0, 0, 0, NULL, NULL, 1, 0, 0, NOW(), NOW()),
(9, 1, 'B3-002', 'B3', 'C区', 0, 0, 0, NULL, NULL, 1, 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE `space_no` = VALUES(`space_no`);

-- 更新停车场空闲数量（原来99空闲 + 新增8个空闲 = 107）
UPDATE `parking_lot` SET `available_spaces` = 107 WHERE `id` = 1;

-- 4. 测试停车记录（进行中，模拟车辆当前停在该车位）
INSERT INTO `parking_record` (`id`, `user_id`, `lot_id`, `space_id`, `plate_number`, `entry_time`, `exit_time`, `duration_minutes`, `fee`, `paid_amount`, `pay_status`, `record_status`, `deleted`, `create_time`, `update_time`)
VALUES (1, 1, 1, 1, '京A12345', DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL, NULL, NULL, NULL, 0, 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE `user_id` = 1, `space_id` = 1, `plate_number` = '京A12345', `record_status` = 0;

-- ============================================================
-- 测试流程说明
-- ============================================================
-- 1. 启动后端服务，确保 MySQL 已连接
-- 2. 执行本脚本初始化测试数据
--
-- 【挪车测试】
-- 3. 打开小程序 → 扫码挪车
-- 4. 停车场选择 "测试广场停车场"
-- 5. 输入车位编号 "B2-015"，点击确认
-- 6. 页面应跳转到挪车请求页，显示车牌 "京A****5"（脱敏）
-- 7. 选择挪车原因，填写联系方式（可选），点击发送
-- 8. 匿名请求（requesterId 为空）应能正常提交成功
--
-- 【共享车位测试】
-- 3. 打开小程序 → 个人中心 → 共享车位
-- 4. 选择停车场 "测试广场停车场"
-- 5. 输入空闲车位编号，如 A1-001 / A1-002 / B2-016 / B3-001
-- 6. 选择时间模式（固定时段或每日重复），设置价格
-- 7. 确认收益计算后点击发布
-- 8. 发布成功后可在共享记录中查看、暂停、恢复、结束
--
-- 【预约停车测试】
-- 3. 打开小程序 → 首页 → 选择测试广场停车场
-- 4. 在 B1/B2/B3 楼层图中点击空闲车位（绿色）→ 预约
-- 5. 填写车牌号、时间，提交 → 支付预约费
-- 6. 到预约列表中确认入场、离场、支付停车费
-- ============================================================
