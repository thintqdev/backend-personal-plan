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
const userRouter = require("./routes/user");
const quoteRouter = require("./routes/quote");
const taskRouter = require("./routes/task");
const statsRouter = require("./routes/stats");
const goalRouter = require("./routes/goal");
const financeRouter = require("./routes/finance");
const noteRouter = require("./routes/note");
const savingsGoalRouter = require("./routes/savingsGoal");
const aiExpenseRouter = require("./routes/aiExpense");
const authRouter = require("./routes/auth");
const emailAdminRouter = require("./routes/emailAdmin");
const resendVerificationRouter = require("./routes/resendVerificationEmail");
const tokenAdminRouter = require("./routes/tokenAdmin");

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/stats", statsRouter);
app.use("/api/goals", goalRouter);
app.use("/api/finance", financeRouter);
app.use("/api/notes", noteRouter);
app.use("/api/savings-goals", savingsGoalRouter);
app.use("/api/ai-expense", aiExpenseRouter);
app.use("/api/admin/email", emailAdminRouter);
app.use("/api/admin/tokens", tokenAdminRouter);
app.use("/api/resend-verification", resendVerificationRouter);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");

    // Start cron jobs after DB connection
    const { startCronJobs } = require("./services/cronService");
    startCronJobs();

    // Initialize MongoDB email queue service
    const emailQueue = require("./services/emailQueueMongoDB");
    console.log("MongoDB email queue service initialized");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Personal Plan API");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
