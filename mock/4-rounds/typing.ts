type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

type PublicUser = Omit<User, "password">;

function omitPassword<T extends { password: string }>(
  user: T,
): Omit<T, "password"> {
  const { password, ...rest } = user;
  return rest;
}
