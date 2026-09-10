// app.post('/auth/login', async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ error: 'Invalid credentials' });

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

//     const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
//     res.json({ accessToken });
//   } catch (err) {
//     next(err);
//   }
// });

// rate limiting - Targeted brute force (many passwords against one account) — IP-based limiting works well here, since it's usually one attacker machine hammering one endpoint.

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP per window
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
});

app.post("/auth/login", loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.lockedUntil && user.lockedUntil > Date.now()) {
      return res
        .status(429)
        .json({ error: "Account temporarily locked. Try again later." });
    }

    const valid = user && (await bcrypt.compare(password, user.password));

    if (!valid) {
      if (user) {
        user.failedAttempts = (user.failedAttempts || 0) + 1;
        if (user.failedAttempts >= 5) {
          user.lockedUntil = Date.now() + 15 * 60 * 1000; // lock 15 min
          user.failedAttempts = 0;
        }
        await user.save();
      }
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // successful login — reset counters
    user.failedAttempts = 0;
    user.lockedUntil = null;

    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET, {
      expiresIn: "30d",
    });
    await RefreshToken.create({ userId: user.id, token: refreshToken });
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
});
