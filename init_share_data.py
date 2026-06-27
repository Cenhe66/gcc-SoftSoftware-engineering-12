import mysql.connector
from datetime import datetime, timedelta
import random

# 连接数据库
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='123456',
    database='parking_db'
)
cursor = conn.cursor(dictionary=True)

try:
    # 1. 查询当前空闲且没有owner的车位
    cursor.execute("""
        SELECT id, lot_id, space_no, floor
        FROM parking_space
        WHERE status = 0 AND owner_id IS NULL AND deleted = 0
        ORDER BY lot_id, id
        LIMIT 30
    """)
    available_spaces = cursor.fetchall()

    print(f"找到 {len(available_spaces)} 个可分配的空闲车位")

    # 2. 给测试用户分配车位
    target_users = [2, 4, 5]  # 张三、李四、王五
    spaces_per_user = 3

    space_index = 0
    assigned_spaces = []

    for user_id in target_users:
        for i in range(spaces_per_user):
            if space_index >= len(available_spaces):
                break
            space = available_spaces[space_index]
            cursor.execute("""
                UPDATE parking_space
                SET owner_id = %s
                WHERE id = %s
            """, (user_id, space['id']))
            assigned_spaces.append({
                'space_id': space['id'],
                'lot_id': space['lot_id'],
                'space_no': space['space_no'],
                'floor': space['floor'],
                'owner_id': user_id
            })
            space_index += 1

    print(f"分配了 {len(assigned_spaces)} 个私人车位")

    # 3. 为部分车位生成共享记录（只给张三生成2个共享记录）
    zhangsan_spaces = [s for s in assigned_spaces if s['owner_id'] == 2]

    share_records_created = 0
    for space in zhangsan_spaces[:2]:
        start_time = datetime.now() - timedelta(days=random.randint(1, 3))
        end_time = start_time + timedelta(days=random.randint(7, 14))
        hourly_price = round(random.uniform(3, 8), 2)

        cursor.execute("""
            INSERT INTO share_record (owner_id, space_id, share_type, start_time, end_time, hourly_price, monthly_price, status, create_time, update_time)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            space['owner_id'],
            space['space_id'],
            0,  # 普通车位
            start_time,
            end_time,
            hourly_price,
            0.00,
            1   # 共享中
        ))

        # 更新车位状态为共享中
        cursor.execute("""
            UPDATE parking_space
            SET status = 3, is_shared = 1, lock_status = 1
            WHERE id = %s
        """, (space['space_id'],))

        share_records_created += 1

    print(f"创建了 {share_records_created} 条共享记录")

    # 4. 给李四、王五的车位保持私人状态（不创建共享记录），用于测试"私人车位不可预约"
    lisi_spaces = [s for s in assigned_spaces if s['owner_id'] == 4]
    wangwu_spaces = [s for s in assigned_spaces if s['owner_id'] == 5]

    # 5. 创建一个即将过期的共享记录（用于测试自动结束）
    if zhangsan_spaces:
        expire_space = zhangsan_spaces[-1]
        start_time = datetime.now() - timedelta(days=5)
        end_time = datetime.now() + timedelta(hours=2)  # 2小时后过期

        cursor.execute("""
            INSERT INTO share_record (owner_id, space_id, share_type, start_time, end_time, hourly_price, monthly_price, status, create_time, update_time)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            expire_space['owner_id'],
            expire_space['space_id'],
            0,
            start_time,
            end_time,
            5.00,
            0.00,
            1
        ))

        cursor.execute("""
            UPDATE parking_space
            SET status = 3, is_shared = 1, lock_status = 1
            WHERE id = %s
        """, (expire_space['space_id'],))

        share_records_created += 1
        print(f"创建了1条即将过期的共享记录（space_id={expire_space['space_id']}）")

    conn.commit()

    print("\n数据初始化完成！")
    print(f"- 张三(id=2): {len(zhangsan_spaces)} 个车位，其中2个已共享，1个即将过期")
    print(f"- 李四(id=4): {len(lisi_spaces)} 个私人车位（未共享）")
    print(f"- 王五(id=5): {len(wangwu_spaces)} 个私人车位（未共享）")

except Exception as e:
    conn.rollback()
    print(f"错误: {e}")
    raise
finally:
    cursor.close()
    conn.close()
