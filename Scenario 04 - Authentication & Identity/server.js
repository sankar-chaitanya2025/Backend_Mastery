const express = require("express");
const app = express();
const connectDB = require("./db");

const router = express.Router();
const authRouter = require("./routes/auth");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const PORT = 3000;

app.use(express.json());

app.use(
  session({
    name: "sid", // cookie name
    secret: "super-secret-key", // used to sign the cookie
    resave: false, // don't save unchanged sessions
    saveUninitialized: false, // don't create empty sessions
    store: MongoStore.create({
      mongoUrl: "mongodb://localhost:27017/authdb",
    }),
    cookie: {
      httpOnly: true, // JS cannot read cookie
      secure: false, // true only in HTTPS
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  }),
);

connectDB();

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
