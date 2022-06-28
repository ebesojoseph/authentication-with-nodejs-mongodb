const { app, client, PORT, SALT, SECRET } = require("./app");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { auth } = require("./middleware/auth");
const Joi = require("joi");

const userSchema = Joi.object({
  firstname: Joi.string().required(),
  password: Joi.string().required().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  username: Joi.string().min(6).required(),
  lastname: Joi.string().required(),
  email: Joi.string().email().required(),
});

const Users = client.db("test-projects").collection("users");

app.post("/register", async (req, res) => {
  console.log(req.headers["content-type"]);

  const { username, password, lastname, firstname, email } = req.body;
  let query = {};

  query.email = email;
  query.username = username;

  const userExist = await Users.findOne(query);

  if (userExist) {
    req.session.error =
      "Account already exist try using another user name or email";
    res.redirect("/error");
  }
  const { error, value } = userSchema.validate({
    username,
    password,
    lastname,
    firstname,
    email,
  });

  if (error) {
    req.session.error = error.details[0].message;
    res.redirect("/error");
  } else {
    console.log(SALT);
    const hash = bcrypt.hashSync(password, SALT);

    await client.connect();
    const user = await Users.insertOne({
      email,
      username,
      firstname,
      lastname,
      date_created: Date.now(),
      password: hash,
    });
    if (user) {
      if (req.headers["content-type"] !== "application/json") {
        res.redirect("/success");
      } else {
        res.json(user);
      }
    }
  }
});

//makeing signin verifications
app.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  let query = {};

  if (username.split("@")[1]) {
    query.email = username;
  } else {
    query.username = username;
  }
  console.log(query);

  const user = await Users.findOne(query);
  console.log(user);

  if (user) {
    console.log(user);
    if (bcrypt.compareSync(password, user.password)) {
      const token = await jwt.sign(user, SECRET, { expiresIn: '1h' });
      req.session.auth = token;
      res.redirect("/dashboard");
    } else {
      req.session.error = "Wrong password or username inputed ";
      res.redirect("/error");
    }
  } else {
    req.session.error = "Wrong password or username inputed ";
    res.redirect("/error");
  }
});
//rendering error page
app.get("/error", (req, res) => {
  res.render("error", { error: req.session.error });
});
//rendering a success page
app.get("/success", (req, res) => {
  res.render("success");
});
//rendering the sign up page
app.get("/signin", (req, res) => {
  res.render("signin");
});

//rendering the register page
app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/", (req, res) => {
  res.render("register");
});
//rendering the dashboard
app.get("/dashboard", auth, (req, res) => {
  if (req.headers["content-type"] !== "application/json") {
    console.log("index.js");
    res.render("dashboard", { user: req.session.user });
  }
  else{
    res.json({ user: req.session.user });
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port:${PORT}`);
});
