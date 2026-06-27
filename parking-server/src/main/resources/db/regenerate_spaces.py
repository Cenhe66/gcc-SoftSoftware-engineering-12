import subprocess
import re

def run_mysql(sql):
    result = subprocess.run(
        ['mysql', '-u', 'root', '-p123456', '-e', f'USE parking_db; {sql}'],
        capture_output=True, text=True
    )
    return result.stdout, result.stderr, result.returncode

# 1. 删除所有 A-xxx 格式的新增车位
print("删除 A-xxx 格式车位...")
stdout, stderr, rc = run_mysql("DELETE FROM parking_space WHERE space_no LIKE 'A-%';")
if rc != 0:
    print("删除失败:", stderr)
else:
    print("删除成功")

# 2. 定义每个停车场的楼层配置
lot_configs = {
    1: {'B2': 100, 'B1': 30, 'F1': 30, 'B3': 10},   # 万达
    2: {'B2': 35, 'B1': 35, 'F1': 30},              # 国贸
    3: {'B2': 25, 'B1': 25, 'F1': 30},              # 三里屯
    4: {'B2': 35, 'B1': 35, 'F1': 30},              # 朝阳大悦城
    5: {'B2': 35, 'B1': 35, 'F1': 30},              # 望京SOHO
}

# 3. 查询每个 lot_id + floor 的现有最大编号
print("\n查询现有车位最大编号...")
max_nums = {}
for lot_id in lot_configs:
    max_nums[lot_id] = {}
    for floor in lot_configs[lot_id]:
        sql = (
            f"SELECT MAX(CAST(SUBSTRING_INDEX(space_no, '-', -1) AS UNSIGNED)) "
            f"FROM parking_space WHERE lot_id = {lot_id} AND floor = '{floor}' AND deleted = 0;"
        )
        stdout, stderr, rc = run_mysql(sql)
        if rc == 0:
            lines = stdout.strip().split('\n')
            if len(lines) >= 2:
                val = lines[1].strip()
                max_num = int(val) if val and val != 'NULL' else 0
                max_nums[lot_id][floor] = max_num
                print(f"  lot_id={lot_id}, floor={floor}, 现有最大编号={max_num}")
            else:
                max_nums[lot_id][floor] = 0
        else:
            max_nums[lot_id][floor] = 0

# 4. 生成补充 SQL
sql_lines = ['USE parking_db;']
for lot_id, floors in lot_configs.items():
    for floor, count in floors.items():
        start_num = max_nums[lot_id].get(floor, 0) + 1
        for i in range(start_num, start_num + count):
            space_no = f"{floor}-{i:03d}"
            sql_lines.append(
                f"INSERT INTO parking_space (lot_id, space_no, floor, status, is_shared, deleted) "
                f"VALUES ({lot_id}, '{space_no}', '{floor}', 0, 0, 0);"
            )

sql = '\n'.join(sql_lines)

# 5. 执行补充 SQL
print(f"\n生成 {len(sql_lines)-1} 条 INSERT 语句，开始执行...")
result = subprocess.run(
    ['mysql', '-u', 'root', '-p123456'],
    input=sql, capture_output=True, text=True
)
print('Return code:', result.returncode)
if result.stderr:
    print('STDERR:', result.stderr)
if result.returncode == 0:
    print("执行成功！")
