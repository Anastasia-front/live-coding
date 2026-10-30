data = """
1001,iphone 15,2,32000
1002,airpods,3,8000
1003,iphone 15,1,32000
wrong,row
1004,macbook air,1,45000
1005,airpods,2,8000
"""


def get_product_revenue(data):
    revenue = {}
    lines = data.splitlines()
    for line in lines:
        line = line.strip()

        if not line:
            continue

        parts = [part.strip() for part in line.split(",")]

        if len(parts) != 4:
            continue

        try:
            name = parts[1]
            amount = int(parts[2])
            price = int(parts[3])
        except ValueError:
            continue

        if name not in revenue:
            revenue[name] = 0

        revenue[name] += amount * price

    return revenue


print(get_product_revenue(data))
# {
#     "iphone 15": 96000,
#     "airpods": 40000,
#     "macbook air": 45000
# }
