// app.post("/password-reset/request", async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({ email });

//   const resetToken = Math.random().toString(36).substring(2); //must use a cryptographically secure generator
//   // for anything security-sensitive (reset tokens, session ids, API keys)
//   user.resetToken = resetToken;
//   //No token expiry
//   await user.save();

//   await emailService.sendResetEmail(email, resetToken);

//   res.json({ message: "Password reset email sent" });
// });

// app.post("/password-reset/confirm", async (req, res) => {
//   const { email, resetToken, newPassword } = req.body;
//   const user = await User.findOne({ email, resetToken });

//   user.password = newPassword; //No password hashing
//   user.resetToken = null;
//   await user.save();

//   res.json({ message: "Password updated" });
// });

const crypto = require("crypto");
const bcrypt = require("bcrypt");

app.post("/password-reset/request", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
      await user.save();
      await emailService.sendResetEmail(email, resetToken);
    }

    // same response whether or not the user exists — avoids enumeration
    res.json({
      message: "If that email is registered, a reset link has been sent",
    });
  } catch (err) {
    next(err);
  }
});

app.post("/password-reset/confirm", async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
});
