USE parking_db;

-- 先查询出具体的空闲车位ID
SET @zs1 = (SELECT id FROM parking_space WHERE status = 0 AND owner_id IS NULL AND deleted = 0 ORDER BY lot_id, id LIMIT 1);
SET @zs2 = (SELECT id FROM parking_space WHERE status = 0 AND owner_id IS NULL AND deleted = 0 ORDER BY lot_id, id LIMIT 1 OFFSET 1);
SET @zs3 = (SELECT id FROM parking_space WHERE status = 0 AND owner_id IS NULL AND deleted = 0 ORDER BY lot_id, id LIMIT 1 OFFSET 2);
SET @ls1 = (SELECT id FROM parking_space WHERE status = 0 AND owner_id IS NULL AND deleted = 0 ORDER BY lot_id, id LIMIT 1 OFFSET 3);
SET @ls2 = (SELECT id FROM parking_space WHERE status = 0 AND owner_id IS NULL AND deleted = 0 ORDER BY lot_id, id LIMIT 1 OFFSET 4);
SET @ls3 = (SELECT id FROM parking_space WHERE status = 0 AND owner_id IS NULL AND deleted = 0 ORDER BY lot_id, id LIMIT 1 OFFSET 5);
SET @ww1 = (SELECT id FROM parking_space WHERE status = 0 AND owner_id IS NULL AND deleted = 0 ORDER BY lot_id, id LIMIT 1 OFFSET 6);
SET @ww2 = (SELECT id FROM parking_space WHERE status = 0 AND owner_id IS NULL AND deleted = 0 ORDER BY lot_id, id LIMIT 1 OFFSET 7);
SET @ww3 = (SELECT id FROM parking_space WHERE status = 0 AND owner_id IS NULL AND deleted = 0 ORDER BY lot_id, id LIMIT 1 OFFSET 8);

-- 分配车位
UPDATE parking_space SET owner_id = 2 WHERE id = @zs1;
UPDATE parking_space SET owner_id = 2 WHERE id = @zs2;
UPDATE parking_space SET owner_id = 2 WHERE id = @zs3;
UPDATE parking_space SET owner_id = 4 WHERE id = @ls1;
UPDATE parking_space SET owner_id = 4 WHERE id = @ls2;
UPDATE parking_space SET owner_id = 4 WHERE id = @ls3;
UPDATE parking_space SET owner_id = 5 WHERE id = @ww1;
UPDATE parking_space SET owner_id = 5 WHERE id = @ww2;
UPDATE parking_space SET owner_id = 5 WHERE id = @ww3;

-- 张三的前2个车位设置为共享中
UPDATE parking_space SET status = 3, is_shared = 1, lock_status = 1 WHERE id = @zs1;
UPDATE parking_space SET status = 3, is_shared = 1, lock_status = 1 WHERE id = @zs2;

-- 创建共享记录（正常共享）
INSERT INTO share_record (owner_id, space_id, share_type, start_time, end_time, hourly_price, monthly_price, status, create_time, update_time)
VALUES
(2, @zs1, 0, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 5.00, 0.00, 1, NOW(), NOW()),
(2, @zs2, 0, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 6.50, 0.00, 1, NOW(), NOW());

-- 张三的第3个车位设置为即将过期的共享（2小时后过期）
UPDATE parking_space SET status = 3, is_shared = 1, lock_status = 1 WHERE id = @zs3;

INSERT INTO share_record (owner_id, space_id, share_type, start_time, end_time, hourly_price, monthly_price, status, create_time, update_time)
VALUES
(2, @zs3, 0, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 2 HOUR), 4.00, 0.00, 1, NOW(), NOW());

-- 验证结果
SELECT '张三的车位' as desc_text, id, lot_id, space_no, owner_id, status, is_shared FROM parking_space WHERE owner_id = 2;
SELECT '李四的车位' as desc_text, id, lot_id, space_no, owner_id, status, is_shared FROM parking_space WHERE owner_id = 4;
SELECT '王五的车位' as desc_text, id, lot_id, space_no, owner_id, status, is_shared FROM parking_space WHERE owner_id = 5;
SELECT '张三的共享记录' as desc_text, id, space_id, status, start_time, end_time FROM share_record WHERE owner_id = 2;
