data = """
iphone,2,1000
macbook,1,2500
iphone,3,1000
airpods,5,200
macbook,2,2500
broken,row
"""


def get_product_quantities(data):
    result = {}

    lines = data.splitlines()
    for line in lines:
        line = line.strip()

        if not line:
            continue
        parts = [part.strip() for part in line.split(",")]

        if len(parts) != 3:
            continue

        try:
            name = parts[0]
            amount = int(parts[1])
        except ValueError:
            continue

        if name not in result:
            result[name] = 0

        result[name] += amount

    return result


print(get_product_quantities(data))
# {
#     "iphone": 5,
#     "macbook": 3,
#     "airpods": 5
# }
