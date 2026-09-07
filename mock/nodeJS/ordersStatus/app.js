// app.js
const express = require("express");
const app = express();

app.use(express.json());
app.use("/orders", ordersRouter);
app.use("/users", usersRouter);

app.use(errorHandler); // must be registered AFTER all routes/middleware
