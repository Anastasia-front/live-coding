// app.post('/auth/login', async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   const valid = await bcrypt.compare(password, user.password);
//   if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

//   const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
//   const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });

//   res.json({ accessToken, refreshToken });
// });

// app.post('/auth/refresh', async (req, res) => {
//   const { refreshToken } = req.body;
//   const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);

//   const accessToken = jwt.sign({ id: payload.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
//   res.json({ accessToken });
// });

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
    });

    await RefreshToken.create({ userId: user.id, token: refreshToken });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

app.post("/auth/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    const payload = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const storedToken = await RefreshToken.findOne({
      userId: payload.id,
      token: refreshToken,
    });
    if (!storedToken) {
      // token not in our valid list — either already rotated out, or stolen/reused
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    await RefreshToken.deleteOne({ _id: storedToken._id }); // invalidate old one

    const accessToken = jwt.sign({ id: payload.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const newRefreshToken = jwt.sign(
      { id: payload.id },
      process.env.REFRESH_SECRET,
      { expiresIn: "30d" },
    );
    await RefreshToken.create({ userId: payload.id, token: newRefreshToken });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});

app.post("/auth/logout", async (req, res) => {
  await RefreshToken.deleteOne({ token: req.cookies.refreshToken });
  res.clearCookie("refreshToken");
  res.json({ success: true });
});
