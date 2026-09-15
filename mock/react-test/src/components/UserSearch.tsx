import { useEffect, useState } from "react";

type UserResult = { id: number; name: string };

export function UserSearch() {
  const [search, setSearch] = useState<string>("");
  const [error, setError] = useState<Error | null>(null);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setUsers([]);
      setLoading(true);
      setError(null);
      fetch(`/api/users?query=${search}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed response");
          return res.json();
        })
        .then((data) => {
          if (!cancelled) setUsers(data);
        })
        .catch((e) => {
          if (!cancelled) setError(e.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {}, []);

  return (
    <div>
      <input
        id="search"
        placeholder="Type to search..."
        onChange={(e) => setSearch(e.target.value)}
        value={search}
      />
      {loading ? (
        "Searching..."
      ) : error ? (
        `Error had occurred while fetching. Error details: ${error.message}`
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
