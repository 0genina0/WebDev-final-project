const express = require("express");
const app = express();
const PORT = 3000;


app.get("/", (req, res) => {
    res.send("Haiiii");
});

app.use('/', express.static('public'));

app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});

