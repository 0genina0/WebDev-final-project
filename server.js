const express = require("express");
const app = express();
const PORT = 3000;

const admin = "admin";
const adminPass = "12345";

const storeData = require("./stores.json");


app.use('/', express.static('public'));
app.use(express.json());

app.get('/login', (req, res) => { 
    res.send(`<!DOCTYPE html>
  <html>
    <body>
      <h1>Login</h1>
      <form method="POST" action="/login" id="loginForm">
        <label for="username">Username:</label>
        <input type="text" name="username" id="username" required /><br/><br/>
        <label for="password">Password:</label>
        <input type="password" name="password" id="password" required /><br/><br/>
        <button type="submit" id="submit">Login</button>
      </form>
      <hr>
      <h1>Store List</h1>
      <ul id="venueUl"></ul> <script src="/client.js"></script> </body>
  </html>`);
  });

app.get('/api/stores', (req, res) =>{
  res.json(storeData);
});

console.log("data loaded!");





//login form
 let isLoggedIn = false;
 app.post ("/login", (req, res) =>{
   const {username, password }= req.body;

   if(username === admin && password === adminPass){
     isLoggedIn = true;
    return res.json({message: "sucessfully logged in"});
  }
  res.status(401).json({message: "errooooor logging in"});
});

app.post("/api/logout", (req, res) =>
{
  isLoggedIn = false; 

  res.json({message: "succesfully logged out"});
} )

app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});

