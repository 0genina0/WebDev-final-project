const express = require("express");
const app = express();
const PORT = 3000;

const storeData = require("./stores.json");


app.use('/', express.static('public'));
app.use(express.json());

app.get('/api/stores', (req, res) =>{
  res.json(storeData);
});

console.log("data loaded:", storeData);


app.get("/", (req, res) => {
    res.send("Haiiii");
});


// app.get('/api/stores')


app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});

