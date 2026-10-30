data = """
101,alice,iphone,2,1000
102,bob,macbook,1,2500
103,alice,airpods,3,200
104,charlie,iphone,1,1000
105,alice,macbook,1,2500
106,bob,airpods,5,200
broken,row
107,charlie,iphone,wrong,1000
"""


def get_top_customer_spending(data):
    totals = {}

    lines = data.splitlines()
    for line in lines:
        line = line.strip()

        if not line:
            continue

        parts = [part.strip() for part in line.split(",")]

        if len(parts) != 5:
            continue

        try:
            name = parts[1]
            amount = int(parts[3])
            price = int(parts[4])
        except ValueError:
            continue

        if name not in totals:
            totals[name] = 0

        totals[name] += amount * price

    result = ()
    maxSpending = max(totals.values())

    for name, total in totals.items():
        if total != maxSpending:
            continue
        if not result and total == maxSpending:
            result = (name, total)

    return result


print(get_top_customer_spending(data))

# Return the customer who spent the most money.

# ("alice", 5100)
