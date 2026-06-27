import subprocess

lots = [
    (1, '万达广场', 100),
    (2, '国贸中心', 100),
    (3, '三里屯太古里', 80),
    (4, '朝阳大悦城', 100),
    (5, '望京SOHO', 100),
]

sql_lines = ['USE parking_db;']

for lot_id, name, count in lots:
    for i in range(1, count + 1):
        space_no = f'A-{i:03d}'
        if i <= 30:
            floor = 'B2'
        elif i <= 60:
            floor = 'B1'
        else:
            floor = 'F1'
        sql_lines.append(
            f"INSERT IGNORE INTO parking_space (lot_id, space_no, floor, status, is_shared, deleted) "
            f"VALUES ({lot_id}, '{space_no}', '{floor}', 0, 0, 0);"
        )

sql = '\n'.join(sql_lines)

result = subprocess.run(
    ['mysql', '-u', 'root', '-p123456'],
    input=sql,
    capture_output=True,
    text=True
)

print('STDOUT:', result.stdout)
print('STDERR:', result.stderr)
print('Return code:', result.returncode)
