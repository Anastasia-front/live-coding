// useTransition marks a state update as non-urgent.
// It helps urgent updates like typing stay responsive while slower rendering work continues in the background.
// It does not make slow code faster; it only changes update priority and exposes pending state.
import { type ChangeEvent, useMemo, useState, useTransition } from "react";

function expensiveFilter(items: string[], query: string) {
  return items.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );
}

type SearchWithTransitionProps = {
  items: string[];
};

export function SearchWithTransition({ items }: SearchWithTransitionProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(items);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    startTransition(() => {
      setResults(expensiveFilter(items, nextQuery));
    });
  }

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <span>Loading...</span>}
      <ul>
        {results.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

type ReportRange = "7d" | "30d" | "90d";

type Transaction = {
  id: string;
  category: string;
  amount: number;
  createdAt: string;
};

type RevenueDashboardProps = {
  transactions: Transaction[];
};

const rangeDays: Record<ReportRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function buildCategoryReport(transactions: Transaction[], range: ReportRange) {
  const cutoff = Date.now() - rangeDays[range] * 24 * 60 * 60 * 1000;
  const totals = new Map<string, number>();

  transactions.forEach((transaction) => {
    if (new Date(transaction.createdAt).getTime() >= cutoff) {
      totals.set(
        transaction.category,
        (totals.get(transaction.category) ?? 0) + transaction.amount,
      );
    }
  });

  return [...totals.entries()]
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function RevenueDashboard({ transactions }: RevenueDashboardProps) {
  const [selectedRange, setSelectedRange] = useState<ReportRange>("30d");
  const [reportRange, setReportRange] = useState<ReportRange>("30d");
  const [isPending, startTransition] = useTransition();

  const report = useMemo(
    () => buildCategoryReport(transactions, reportRange),
    [transactions, reportRange],
  );

  function changeRange(nextRange: ReportRange) {
    setSelectedRange(nextRange);

    startTransition(() => {
      setReportRange(nextRange);
    });
  }

  return (
    <section aria-busy={isPending}>
      <div aria-label="Report range">
        {(["7d", "30d", "90d"] as const).map((range) => (
          <button
            key={range}
            type="button"
            aria-pressed={selectedRange === range}
            onClick={() => changeRange(range)}
          >
            {range}
          </button>
        ))}
      </div>

      {isPending && <p>Updating report...</p>}

      <h2>Revenue for the last {rangeDays[reportRange]} days</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {report.map((row) => (
            <tr key={row.category}>
              <td>{row.category}</td>
              <td>${row.revenue.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
