data = """
iphone,2,1000,completed
macbook,1,2500,completed
iphone,3,1000,cancelled
airpods,5,200,completed
macbook,2,2500,completed
airpods,1,200,cancelled
broken,row
"""


def get_completed_revenue(data):
    groupByProduct = {}

    lines = data.splitlines()
    for line in lines:
        line = line.strip()

        if not line:
            continue

        parts = [part.strip() for part in line.split(",")]

        if len(parts) != 4:
            continue

        try:
            name = parts[0]
            amount = int(parts[1])
            price = int(parts[2])
            status = parts[3]
        except ValueError:
            continue

        if status != "completed":
            continue

        if name not in groupByProduct:
            groupByProduct[name] = 0

        groupByProduct[name] += amount * price

    sortedGroups = sorted(
        groupByProduct.items(), key=lambda item: item[1], reverse=True
    )
    return sortedGroups


print(get_completed_revenue(data))

# Return a list of tuples sorted by revenue from highest to lowest.
# [
#     ("macbook", 7500),
#     ("iphone", 2000),
#     ("airpods", 1000)
# ]
