const express = require("express");
const app = express();
const PORT = 3000;
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const { Client } = require('pg');
const SECRET = 'mySecretCookieToken';

const sessions = {};

const admin = "admin";
const adminPass = "12345";

const client = new Client({
  host: 'host.docker.internal',
  port: 5432,
  user: 'postgres',
  password: '12345',
  database: 'postgres',
});

// Connecting the database to the server (?)
async function connectDB(){
  try {
    await client.connect();
    console.log('Connected to PSQL database with async/wait');
  } catch (err){
    console.error('Connection error :(', err.stack);
  }
}

// Creating a variable to connect with the JSON file
let storeData = require('./stores.json');

//Insert values from JSON file into the PSQL table
function insertRecord(insertValues){
  const insertQuery = `
  INSERT INTO venues (name, url, district, visitors, store_status)
  VALUES ($1, $2, $3, $4, $5)
  ON CONFLICT (name) DO NOTHING
  RETURNING *;`;
  return client.query(insertQuery, insertValues)
    .then(res=> console.log('Inserted Record:', res.rows[0]))
    .catch(err=> console.error('Error inserting record', err.stack));
}

// we made it async so it doesn't try to insert them all at once
async function insertIntoTable() {

  // extending the table w/ storeStatus and visitors
  const storeStatus = ["open", "closed", "under construction", "coming soon"];

  for (store of storeData){
    const visitors = Math.floor(Math.random() * 201);
    const randomStatus = storeStatus[Math.floor(Math.random() * storeStatus.length)];

    const insertValues = [store.name, store.url, store.district, visitors, randomStatus];
    await insertRecord(insertValues);
  }
}

// Insert func is called after we connect to the database
connectDB().then(()=> {
  insertIntoTable();
})

app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cookieParser(SECRET));

app.use('/', express.static('public'));

// Login form sent to HTML (Creating it dynamically)
app.get('/login', (req, res) => { 
    res.send(`<!DOCTYPE html>
  <html>
    <head>
      <link rel="stylesheet" href="public.css">
    </head>
    <body>
      <div class="login-container">
        <h1>Login</h1>
        <form id="loginForm">
          <input type="text" name="username" id="username" placeholder="Username" required />
          <input type="password" name="password" id="password" placeholder="Password" required />
          <button type="submit" id="submit">Sign In</button>
        </form>
      </div>
      <script src="/client.js"></script>
    </body>
  </html>`);
});

// Checking the admin status, whether it's logged in or not
app.get("/api/status", (req, res) => {
  const token = req.signedCookies.authToken;
  const isLoggedIn = !!(token && sessions[token]);

  res.json({ loggedIn: isLoggedIn});
});

// API route for displaying the stores (?)
app.get('/api/stores', async (req, res) => {
  const district = req.query.district; // Fetches value from the dropdown
  
  try {
      let result;
      if (district) {
          // Database handles the filtering
          result = await client.query('SELECT * FROM venues WHERE district = $1 ORDER BY id ASC', [district]);
      } else {
          result = await client.query('SELECT * FROM venues ORDER BY id ASC');
      }
      res.json(result.rows);
  } catch (err) {
      res.status(500).send("DB Error");
  }
});

console.log("data loaded!");

//login form
//  let activeTokens = new Set(); //new SET inspect :D ?????
 app.post ("/login", (req, res) =>{
   const {username, password }= req.body;

   if (username === admin && password === adminPass) {
    const token = crypto.randomBytes(64).toString("hex");
    
    sessions[token] = {username};

    res.cookie("authToken", token, {
      signed: true,
      httpOnly: true,
      sameSite: "lax",
    });

    return res.redirect("/");
  }

  return res.status(401).send("Wrong login");
});

// Log out
app.post("/api/logout", (req, res) => {
  const token = req.signedCookies.authToken;
  if (token) {
    delete sessions[token];
  }
  res.clearCookie("authToken");
  res.redirect('/');
});

//Function i dont know, but the EDIT, DELETE, ADD, cannot work without this
function requireLogin(req, res, next) {
  const token = req.signedCookies.authToken;

  if (token && sessions[token]) {
    req.user = sessions[token];
    next();
  } else {
    res.status(401).json({ message: "Not logged in" });
  }
}

// DELETE
app.delete("/api/stores/:id", requireLogin, async (req, res) => {
  await client.query('DELETE FROM venues WHERE id = $1', [req.params.id]);
  res.json({ message: "Deleted" });
});

// POST - Add new store
app.post("/api/stores", requireLogin, async (req, res) => {
  const { name, url, district, visitors, store_status } = req.body;
  const result = await client.query(
      'INSERT INTO venues (name, url, district, visitors, store_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, url, district, visitors, store_status]
  );
  res.status(201).json(result.rows[0]);
});

// PUT - Edit a store
app.put("/api/stores/:id", requireLogin, async (req, res) => {
  const { name, url, district, visitors, store_status } = req.body;
  const result = await client.query(
      'UPDATE venues SET name=$1, url=$2, district=$3, visitors=$4, store_status=$5 WHERE id=$6 RETURNING *',
      [name, url, district, visitors, store_status, req.params.id]
  );
  res.json(result.rows[0]);
});

// PORT
app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});