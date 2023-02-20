const express = require("express");
const app = express();
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const auth = require("./routes/auth");
const chat = require("./routes/chat");
const message = require("./routes/message");
const error = require("./middleware/error");
dotenv.config();
connectDB();

app.use(express.json());
app.use("/api/v1/auth", auth);
app.use("/api/v1/chat", chat);
app.use("/api/v1/message", message);
app.use(error);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server Started on PORT ${PORT}`));
