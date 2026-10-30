data = """
1,alice,completed,120
2,bob,cancelled,300
3,alice,completed,80
4,charlie,completed,200
5,bob,completed,150
6,alice,cancelled,500
7,charlie,completed,50
"""


def get_top_customer(data):
    totals = {}

    lines = data.splitlines()
    for line in lines:
        line = line.strip()

        if not line:
            continue

        parts = [part.strip() for part in line.split(",")]

        if len(parts) != 4:
            continue

        try:
            name = str(parts[1])
            status = str(parts[2])
            amount = int(parts[3])

        except ValueError:
            continue

        if status != "completed":
            continue

        if name not in totals:
            totals[name] = 0

        totals[name] += amount

#  if not totals:
#         return ()

#     maxSpending = max(totals.values())

#     for name, total in totals.items():
#         if total == maxSpending:
#             return (name, total)

#     return ()
    result = ()

    for name, amount in totals.items():
        if not result or amount > result[1]:
            result = (name, amount)
    return result

#  better solution   return max(totals.items(), key=lambda item: item[1])

print(get_top_customer(data))

# ("charlie", 250)
