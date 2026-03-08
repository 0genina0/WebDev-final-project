const express = require("express");
//const session = require("express-session");
const app = express();
const PORT = 3000;
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const { Client } = require('pg');


const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '12345',
  database: 'postgres',
});

async function connectDB(){
  try {
    await client.connect();
    console.log('Connected to PSQL database with async/wait');
  } catch (err){
    console.error('Connection error :(', err.stack);
  }
}

let storeData = require('./stores.json');



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


async function insertIntoTable() {

  const storeStatus = ["open", "closed", "under construction", "coming soon"];


  for (store of storeData){
    const visitors = Math.floor(Math.random() * 201);
    const randomStatus = storeStatus[Math.floor(Math.random() * storeStatus.length)];

    const insertValues = [store.name, store.url, store.district, visitors, randomStatus];
    await insertRecord(insertValues);
  }
}



connectDB().then(()=> {
  insertIntoTable();
})







app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(cookieParser());

app.use('/', express.static('public'));

// app.use(session({
//   secret: "supersecretkey",
//   resave: false,
//   saveUninitialized: false,
// }));

const admin = "admin";
const adminPass = "12345";



// add ids if missing
// storeData = storeData.map((s, index) => ({
//   id: s.id ?? index + 1,
//   ...s,
// }))

app.get('/login', (req, res) => { 
    res.send(`<!DOCTYPE html>
  <html>
    <body>
      <h1>Login</h1>
      <form id="loginForm">
        <label for="username">Username:</label>
        <input type="text" name="username" id="username" required /><br/><br/>
        <label for="password">Password:</label>
        <input type="password" name="password" id="password" required /><br/><br/>
        <button type="submit" id="submit">Login</button>
      </form>
      
    <script src="/client.js"></script>
    </body>
  </html>`);
});

app.get("/api/status", (req, res) => {
  const token = req.cookies.authToken;
  res.json({ loggedIn: !!token && activeTokens.has(token) });
});

app.get('/api/stores', async (req, res) => {
  const district = req.query.district; // This catches the ?district=...
  
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
 //let isLoggedIn = false;
 let activeTokens = new Set(); //new SET inspect :D
 app.post ("/login", (req, res) =>{
   const {username, password }= req.body || {};

   if (username === admin && password === adminPass) {
    const token = crypto.randomBytes(24).toString("hex");
    activeTokens.add(token);

    res.cookie("authToken", token, {
      httpOnly: true,
      sameSite: "lax",
      // secure: true, // only if using https
    });

    return res.redirect("/");
  }

  return res.status(401).send("Wrong login");
});

// Log out
app.post("/api/logout", (req, res) => {
  const token = req.cookies.authToken;
  if (token) activeTokens.delete(token);
  res.clearCookie("authToken");
  res.json({ message: "Logged out" });
});

//Function 
function requireLogin(req, res, next) {
  const token = req.cookies.authToken;
  if (!token || !activeTokens.has(token)) {
    return res.status(401).json({ message: "Not logged in" });
  }
  next();
}

// DELETE
app.delete("/api/stores/:id", requireLogin, async (req, res) => {
  await client.query('DELETE FROM venues WHERE id = $1', [req.params.id]);
  res.json({ message: "Deleted" });
});

// POST
app.post("/api/stores", requireLogin, async (req, res) => {
  const { name, url, district, visitors, store_status } = req.body;
  const result = await client.query(
      'INSERT INTO venues (name, url, district, visitors, store_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, url, district, visitors, store_status]
  );
  res.status(201).json(result.rows[0]);
});

// PUT
app.put("/api/stores/:id", requireLogin, async (req, res) => {
  const { name, url, district, visitors, store_status } = req.body;
  const result = await client.query(
      'UPDATE venues SET name=$1, url=$2, district=$3, visitors=$4, store_status=$5 WHERE id=$6 RETURNING *',
      [name, url, district, visitors, store_status, req.params.id]
  );
  res.json(result.rows[0]);
});

// // CREATING A STORE
// app.post("/api/stores", requireLogin, (req, res) => {
//   const { name, url, district } = req.body || {};
//   if (!name || !url || !district) {
//   return res.status(400).json({ message: "name, url, district are required" });
// }

//   const newStoreAdded = {
//     id: storeData.length + 1,
//     name,
//     url,
//     district,
//   };

//   storeData.push(newStoreAdded);
//   res.status(201).json(newStoreAdded);
// })

// // UPDATE STORE
// app.put("/api/stores/:id", requireLogin, (req, res) => {
//   const id = Number(req.params.id);
//   const store = storeData.find(s => Number(s.id) === id);

//   if (!store) return res.status(404).json();

//   const { name, url, district } = req.body || {};
//   if (name !== undefined) store.name = name;
//   if (url !== undefined) store.url = url;
//   if (district !== undefined) store.district = district;

//   res.json(store);
// }) 

// // DELETE STORE
// app.delete("/api/stores/:id", requireLogin, (req, res) => {
//   const id = Number(req.params.id);
//   const index = storeData.findIndex(s => Number(s.id) === id);

//   if (index === -1) return res.status(404).json();

//   const deleted = storeData.splice(index, 1)[0];
//   res.json({ message: "Deleted", deleted });
// });

// PORT
app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});