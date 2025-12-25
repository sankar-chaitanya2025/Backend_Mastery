const express = require("express");
const app = express();
const { connectDB } = require("./db");

const router = express.Router();
const authRouter = require("./routes/auth");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const PORT = 3000;

app.use(express.json());

app.use(
  session({
    name: "sid",
    secret: "super-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/authdb",
    }),
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60,
    },
  }),
);

connectDB();

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
