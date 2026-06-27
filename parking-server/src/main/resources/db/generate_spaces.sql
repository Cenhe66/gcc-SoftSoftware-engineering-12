-- 批量生成车位
-- 为每个停车场补充车位，编号格式 A-001 ~ A-100

USE parking_db;

DELIMITER $$

DROP PROCEDURE IF EXISTS generate_spaces$$

CREATE PROCEDURE generate_spaces()
BEGIN
    DECLARE i INT DEFAULT 1;

    -- lot_id=1 万达广场 补充100个
    SET i = 1;
    WHILE i <= 100 DO
        INSERT IGNORE INTO parking_space (lot_id, space_no, floor, status, is_shared, deleted)
        VALUES (1, CONCAT('A-', LPAD(i, 3, '0')),
            CASE
                WHEN i <= 30 THEN 'B2'
                WHEN i <= 60 THEN 'B1'
                ELSE 'F1'
            END, 0, 0, 0);
        SET i = i + 1;
    END WHILE;

    -- lot_id=2 国贸中心 补充100个
    SET i = 1;
    WHILE i <= 100 DO
        INSERT IGNORE INTO parking_space (lot_id, space_no, floor, status, is_shared, deleted)
        VALUES (2, CONCAT('A-', LPAD(i, 3, '0')),
            CASE
                WHEN i <= 30 THEN 'B2'
                WHEN i <= 60 THEN 'B1'
                ELSE 'F1'
            END, 0, 0, 0);
        SET i = i + 1;
    END WHILE;

    -- lot_id=3 三里屯太古里 补充80个
    SET i = 1;
    WHILE i <= 80 DO
        INSERT IGNORE INTO parking_space (lot_id, space_no, floor, status, is_shared, deleted)
        VALUES (3, CONCAT('A-', LPAD(i, 3, '0')),
            CASE
                WHEN i <= 30 THEN 'B2'
                WHEN i <= 60 THEN 'B1'
                ELSE 'F1'
            END, 0, 0, 0);
        SET i = i + 1;
    END WHILE;

    -- lot_id=4 朝阳大悦城 补充100个
    SET i = 1;
    WHILE i <= 100 DO
        INSERT IGNORE INTO parking_space (lot_id, space_no, floor, status, is_shared, deleted)
        VALUES (4, CONCAT('A-', LPAD(i, 3, '0')),
            CASE
                WHEN i <= 30 THEN 'B2'
                WHEN i <= 60 THEN 'B1'
                ELSE 'F1'
            END, 0, 0, 0);
        SET i = i + 1;
    END WHILE;

    -- lot_id=5 望京SOHO 补充100个
    SET i = 1;
    WHILE i <= 100 DO
        INSERT IGNORE INTO parking_space (lot_id, space_no, floor, status, is_shared, deleted)
        VALUES (5, CONCAT('A-', LPAD(i, 3, '0')),
            CASE
                WHEN i <= 30 THEN 'B2'
                WHEN i <= 60 THEN 'B1'
                ELSE 'F1'
            END, 0, 0, 0);
        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

CALL generate_spaces();
DROP PROCEDURE IF EXISTS generate_spaces;
