require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Swagger API Docs
const setupSwagger = require("./swagger");
setupSwagger(app);

// Routes
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const quoteRouter = require("./routes/quote");
const taskRouter = require("./routes/task");
const statsRouter = require("./routes/stats");
const goalRouter = require("./routes/goal");
const financeRouter = require("./routes/finance");
const noteRouter = require("./routes/note");
const coverRouter = require("./routes/cover");

// Authentication routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/stats", statsRouter);
app.use("/api/goals", goalRouter);
app.use("/api/finance", financeRouter);
app.use("/api/notes", noteRouter);
app.use("/api/covers", coverRouter);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Start cron jobs after DB connection
    const { startCronJobs } = require("./services/cronService");
    startCronJobs();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Personal Plan API");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
