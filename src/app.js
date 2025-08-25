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

app.use("/api/user", userRouter);
app.use("/api/quotes", quoteRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/stats", statsRouter);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Personal Plan API");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
