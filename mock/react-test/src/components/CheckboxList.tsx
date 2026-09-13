import { useEffect, useRef, useState } from "react";

type Item = { id: number; label: string };

const items: Item[] = [
  { id: 1, label: "Apples" },
  { id: 2, label: "Bananas" },
  { id: 3, label: "Cherries" },
];

export function CheckboxList() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allSelected = selectedIds.length === items.length;
  const noneSelected = selectedIds.length === 0;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = !allSelected && !noneSelected;
    }
  }, [allSelected, noneSelected]);

  function toggleOne(id: number) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
  }

  return (
    <div>
      <label>
        <input
          type="checkbox"
          ref={selectAllRef}
          checked={allSelected}
          onChange={toggleAll}
        />
        Select All
      </label>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggleOne(item.id)}
              />
              {item.label}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
