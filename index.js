const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors')

const port = process.env.PORT;
const mongoPort = process.env.AUTHENTICATOR_DB_URL;

mongoose.set("strictQuery", true);
mongoose.connect(mongoPort);
console.log(`MongoDB server started`);

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/user/", require("./routes/user.js"));

app.get("/", async (req, res) => {
  res.send("Hello, Authenticator backend here -_-");
});
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
