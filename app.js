const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
require("dotenv").config();
const path = require("path");
const cors = require("cors");
const cookieSession = require("cookie-session");

//set up the view engine
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.set("views", __dirname + "/views");
app.use(express.urlencoded({ extended: false }));

// app.use(cors);
app.use(express.json());

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SECRET_ONE, process.env.SECRET_TWO],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

// Connection URI
const uri = process.env.DB_URL;
// Create a new MongoClient
const client = new MongoClient(uri);

const PORT = process.env.NODE_ENV == "production" ? 8000 : 3000;
//8-ioT1yvs4rTYzFhxZFMOa0GGETBhHkvTRDUm2km
// try {
//   // Connect the client to the server
//   await client.connect();
//   // Establish and verify connection
//   await client.db("admin").command({ ping: 1 });
//   console.log("Connected successfully to server");
// } finally {
//   // Ensures that the client will close when you finish/error
//   await client.close();
// }

module.exports.app = app;
module.exports.client = client;
module.exports.PORT = PORT;
module.exports.SALT = process.env.SALT;
module.exports.SECRET = process.env.SECRET;
