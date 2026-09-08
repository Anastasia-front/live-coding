// CREATE TABLE votes (
// post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
// user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
//   vote_type TEXT CHECK (vote_type IN ('up', 'down')),
//   PRIMARY KEY (post_id, user_id)  -- enforces "one vote per user per post" at the DB level
// );

async function voteOnPost(postId, userId, voteType) {
  if (voteType !== "up" && voteType !== "down") {
    throw new BadRequestError("voteType must be 'up' or 'down'");
  }

  const postResult = await db.query("SELECT id FROM posts WHERE id = $1", [
    postId,
  ]);
  if (!postResult.rows[0]) throw new NotFoundError("Post not found");

  await db.query(
    `INSERT INTO votes (post_id, user_id, vote_type)
    VALUES ($1, $2, $3)
    ON CONFLICT (post_id, user_id)
    DO UPDATE SET vote_type = EXCLUDED.vote_type`,
    [postId, userId, voteType],
  );

  const countsResult = await db.query(
    `SELECT
       COUNT(*) FILTER (WHERE vote_type = 'up') AS upvotes,
       COUNT(*) FILTER (WHERE vote_type = 'down') AS downvotes
     FROM votes WHERE post_id = $1`,
    [postId],
  );

  return {
    upvotes: parseInt(countsResult.rows[0].upvotes, 10),
    downvotes: parseInt(countsResult.rows[0].downvotes, 10),
  };
}
