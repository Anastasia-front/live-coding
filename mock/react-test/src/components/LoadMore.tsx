import { useEffect, useState } from "react";

type Post = { id: number; title: string };

export function PostList() {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [noMorePost, setNoMorePost] = useState<boolean>(false);

  function fetchData(offset: number) {
    setLoading(true);
    fetch(`/api/posts?page=${offset}`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data) => {
        if (data.length !== 0) {
          setPosts((prevState) => [...prevState, ...data]);
        } else {
          setNoMorePost(true);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchData(1);
  }, []);

  function handleLoading() {
    const nextPage = page + 1;
    fetchData(nextPage);
    setPage(nextPage);
  }

  return (
    <div>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
      {!noMorePost && (
        <button onClick={handleLoading} disabled={loading}>
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
