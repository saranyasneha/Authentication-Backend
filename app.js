require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const User = require("./model/user");
const auth = require("./middleware/auth");
const app = express();
const cors=require('cors')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser=require('cookie-parser')
app.use(cors())
app.use(express.json());
app.use(cookieParser())
app.get("/", (req, res) => {
  res.send("front end and backend are connected!!!");
});
//register
app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!(email && password && firstname && lastname)) {
      res.status(400).send("All fields are required");
    }
    const existingUser = await User.findOne({ email }); //promise
    if (existingUser) {
      res.status(401).send("User already exists");
    }
    const myEncPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstname,
      lastname: lastname,
      email: email.toLowerCase(),
      password: myEncPassword,
    });
    //token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    user.token = token;
    //update or not in DB
    //handle Password situation
    user.password = undefined;
    //send token or send just success yes and redirect - choice
    res.status(201).json(user);
  } catch (error) {
    console.log(error);
  }
});
//login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!(user && password)) {
      res.send(400).send("Field is missing!!");
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.SECRET_KEY,
        { expiresIn: "2h" }
      );
      user.token = token;
      user.password = undefined;
      // res.status(200).json(user);
      //if you want to use cookies
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.status(200).cookie("token", token, options).json({
        success: true,
        token,
        user,
      });
    }
    res.status(400).send("email or password is incorrect");
  } catch (error) {
    console.log(error);
  }
});
app.get("/dashboard", auth, (req, res) => {
  res.send("Welcome to secret informations");
});
module.exports = app;





// require("dotenv").config();
// // require("./config/database").connect();
// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const User = require("./model/user");

// const app = express();

// app.use(express.json); //middle ware
// app.get("/", (req, res) => {
//   res.send("<h1>hello world!!</h1>");
// });
// app.post("/register", async (req, res) => {
//   try {
//     const { firstname, lastname, email, password } = req.body;
//
//     const existedUser = await User.findOne({ email }); //promise
//     if (existedUser) {
//       res.status(401).send("User already exists!!");
//     }
//     const myEncPassword = await bcrypt.hash(password, 10);

//     const user = User.create({
//       firstname,
//       lastname,
//       email: email.toLowerCase(),
//       password: myEncPassword,
//     });
//     //token
//     const token = jwt.sign(
//       {
//         user_id: user._id,
//         email,
//       },
//       process.env.SECRET_KEY,
//       {
//         expiresIn: "3h",
//       }
//     );
//     user.token = token;
//     //update or not

//     //TODO handle password situation
//     res.status(201).json(user);
//   } catch (error) {
//     console.log(error);
//   }
// });

// module.exports = app;
