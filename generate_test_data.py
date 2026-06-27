import pymysql
import random
import math
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '123456',
    'database': 'parking_db',
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}


def calc_parking_fee(minutes, hourly_rate, free_minutes=15, daily_cap=None):
    billable = minutes - free_minutes
    if billable <= 0:
        return Decimal('0.00')
    hours = math.ceil(billable / 60)
    fee = Decimal(str(hours)) * Decimal(str(hourly_rate))
    if daily_cap is not None:
        fee = min(fee, Decimal(str(daily_cap)))
    return fee.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)


def main():
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()

    try:
        # 1. 获取停车场信息
        cursor.execute("SELECT id, hourly_rate, daily_cap, free_minutes FROM parking_lot WHERE deleted = 0")
        lots = {}
        for row in cursor.fetchall():
            lots[row['id']] = {
                'hourly_rate': float(row['hourly_rate']),
                'daily_cap': float(row['daily_cap']) if row['daily_cap'] else None,
                'free_minutes': row['free_minutes'] or 15
            }

        # 2. 获取车位
        cursor.execute("SELECT id, lot_id FROM parking_space WHERE deleted = 0")
        lot_spaces = {lid: [] for lid in lots}
        for row in cursor.fetchall():
            lot_spaces[row['lot_id']].append(row['id'])

        # 3. 获取现有普通用户（排除admin）
        cursor.execute("SELECT id, plate_number FROM user WHERE deleted = 0 AND (user_type IS NULL OR user_type != 2)")
        existing_users = cursor.fetchall()
        user_plates = {}
        for u in existing_users:
            uid = u['id']
            plate = u['plate_number'] or f"京A{random.randint(10000, 99999)}"
            user_plates[uid] = plate

        # 4. 创建15个新用户
        cursor.execute("SELECT MAX(id) as max_id FROM user")
        max_uid = cursor.fetchone()['max_id'] or 0
        new_uids = []
        for i in range(15):
            uid = max_uid + i + 1
            openid = f"test_openid_{uid}_{random.randint(1000, 9999)}"
            nickname = f"测试用户{chr(65 + i)}"
            phone = f"1390000{uid:04d}"
            plate = f"京B{uid:05d}"
            balance = round(random.uniform(0, 200), 2)
            cursor.execute(
                """INSERT INTO user (id, openid, nickname, phone, plate_number, balance, user_type, status, create_time, update_time)
                   VALUES (%s, %s, %s, %s, %s, %s, 0, 1, NOW(), NOW())""",
                (uid, openid, nickname, phone, plate, balance)
            )
            new_uids.append(uid)
            user_plates[uid] = plate

        all_user_ids = list(user_plates.keys())
        conn.commit()

        # 5. 获取各表当前最大id
        cursor.execute("SELECT MAX(id) as max_id FROM reservation")
        max_res_id = cursor.fetchone()['max_id'] or 0
        cursor.execute("SELECT MAX(id) as max_id FROM parking_record")
        max_rec_id = cursor.fetchone()['max_id'] or 0
        cursor.execute("SELECT MAX(id) as max_id FROM payment_order")
        max_ord_id = cursor.fetchone()['max_id'] or 0

        res_id = max_res_id
        rec_id = max_rec_id
        ord_id = max_ord_id

        now = datetime.now().replace(second=0, microsecond=0)
        start_date = (now - timedelta(days=30)).replace(hour=0, minute=0)
        end_date = (now + timedelta(days=2)).replace(hour=23, minute=59)

        # 记录车位占用情况 {space_id: [(start, end), ...]}
        space_occupancy = {}

        reservations_to_insert = []
        records_to_insert = []
        orders_to_insert = []
        active_spaces = set()
        reserved_spaces = set()

        # 6. 生成数据
        current_day = start_date
        while current_day.date() <= end_date.date():
            for lot_id in lots:
                daily_count = random.randint(2, 5)
                for _ in range(daily_count):
                    hour = random.randint(7, 22)
                    minute = random.choice([0, 15, 30, 45])
                    start_time = current_day.replace(hour=hour, minute=minute, second=0, microsecond=0)
                    duration = random.randint(30, 360)
                    end_time = start_time + timedelta(minutes=duration)

                    if not lot_spaces[lot_id]:
                        continue

                    space_id = random.choice(lot_spaces[lot_id])

                    # 检查时间冲突（只检查当前已锁定的预约）
                    conflict = False
                    for (s, e) in space_occupancy.get(space_id, []):
                        if start_time < e and s < end_time:
                            conflict = True
                            break
                    if conflict:
                        continue

                    user_id = random.choice(all_user_ids)
                    plate = user_plates[user_id]
                    lot = lots[lot_id]
                    reserve_hours = max(1, math.ceil(duration / 60))
                    reserve_fee = (Decimal('2.00') * Decimal(str(reserve_hours))).quantize(Decimal('0.01'))

                    res_id += 1

                    # 确定状态
                    if end_time < now:
                        status = random.choices([2, 3, 5], weights=[70, 15, 15])[0]
                    elif start_time <= now <= end_time:
                        status = random.choices([1, 0], weights=[40, 60])[0]
                        if status == 0 and now > start_time + timedelta(minutes=15):
                            status = 5
                    else:
                        status = random.choices([0, 4], weights=[80, 20])[0]

                    entry_time = None
                    exit_time = None
                    cancel_time = None
                    parking_fee = Decimal('0.00')

                    if status == 1:
                        entry_time = start_time + timedelta(minutes=random.randint(0, 15))
                    elif status == 2:
                        entry_time = start_time + timedelta(minutes=random.randint(0, 15))
                        exit_time = end_time
                        actual_minutes = max(1, int((exit_time - entry_time).total_seconds() / 60))
                        parking_fee = calc_parking_fee(actual_minutes, lot['hourly_rate'], lot['free_minutes'], lot['daily_cap'])
                    elif status == 3:
                        cancel_time = start_time - timedelta(minutes=random.randint(5, 30))
                        if cancel_time < start_time - timedelta(hours=1):
                            cancel_time = start_time - timedelta(minutes=random.randint(5, 30))
                    elif status == 5:
                        pass

                    reservations_to_insert.append((
                        res_id, user_id, lot_id, space_id, plate,
                        start_time, end_time, reserve_fee, parking_fee, status,
                        entry_time, exit_time, cancel_time
                    ))

                    # 占用/预约的车位加入冲突检测
                    if status not in [3, 5]:
                        space_occupancy.setdefault(space_id, []).append((start_time, end_time))

                    # 创建 parking_record（使用中或已完成）
                    if status in [1, 2]:
                        rec_id += 1
                        if status == 1:
                            actual_minutes = max(1, int((now - entry_time).total_seconds() / 60))
                            record_fee = calc_parking_fee(actual_minutes, lot['hourly_rate'], lot['free_minutes'], lot['daily_cap'])
                            records_to_insert.append((
                                rec_id, user_id, lot_id, space_id, plate,
                                entry_time, None, actual_minutes, record_fee, Decimal('0.00'),
                                0, 0
                            ))
                            active_spaces.add(space_id)
                        else:
                            actual_minutes = max(1, int((exit_time - entry_time).total_seconds() / 60))
                            records_to_insert.append((
                                rec_id, user_id, lot_id, space_id, plate,
                                entry_time, exit_time, actual_minutes, parking_fee, parking_fee,
                                1, 1
                            ))
                            # 创建支付订单
                            ord_id += 1
                            order_no = f"P{exit_time.strftime('%Y%m%d%H%M%S')}{ord_id:06d}"
                            orders_to_insert.append((
                                ord_id, order_no, user_id, 1, rec_id, parking_fee,
                                2, 2, f"TXN{ord_id}", exit_time
                            ))

                    if status == 0 and start_time <= now <= end_time:
                        reserved_spaces.add(space_id)

            current_day += timedelta(days=1)

        # 7. 批量插入
        if reservations_to_insert:
            cursor.executemany(
                """INSERT INTO reservation (id, user_id, lot_id, space_id, plate_number, start_time, end_time, reserve_fee, parking_fee, status, entry_time, exit_time, cancel_time, create_time, update_time)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())""",
                reservations_to_insert
            )

        if records_to_insert:
            cursor.executemany(
                """INSERT INTO parking_record (id, user_id, lot_id, space_id, plate_number, entry_time, exit_time, duration_minutes, fee, paid_amount, pay_status, record_status, create_time, update_time)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())""",
                records_to_insert
            )

        if orders_to_insert:
            cursor.executemany(
                """INSERT INTO payment_order (id, order_no, user_id, biz_type, biz_id, amount, pay_channel, pay_status, transaction_id, pay_time, create_time, update_time)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())""",
                orders_to_insert
            )

        # 8. 更新车位状态（当前占用/预约）
        for sid in active_spaces:
            cursor.execute("UPDATE parking_space SET status = 1 WHERE id = %s", (sid,))
        for sid in reserved_spaces:
            cursor.execute("UPDATE parking_space SET status = 2 WHERE id = %s", (sid,))

        conn.commit()
        print(f"插入完成：{len(reservations_to_insert)} 条预约，{len(records_to_insert)} 条停车记录，{len(orders_to_insert)} 条支付订单")
        print(f"当前占用车位：{len(active_spaces)}，当前预约车位：{len(reserved_spaces)}")

    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    main()
