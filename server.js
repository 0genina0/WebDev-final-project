const express = require("express");
const app = express();
const PORT = 3000;

const admin = "admin";
const adminPass = "12345";

const storeData = require("./stores.json");


app.use('/', express.static('public'));
app.use(express.json());

app.get('/api/stores', (req, res) =>{
  res.json(storeData);
});

console.log("data loaded:", storeData);

//login form
let isLoggedIn = false;
app.post ("/api/login", (req, res) =>{
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

