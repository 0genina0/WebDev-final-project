const express = require("express");
const app = express();
const PORT = 3000;


const { Client } = require('pg');

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '12345',
    database: 'postgres',
});

async function connectDB() {
    try {
        await client.connect();
        console.log('connected to to PostgreSQL database with async/await');
    }catch(err) {
        console.error('Connection error', err.stack);
    }
}

//connectDB();


const storeData = require("./stores.json");

async function insertStores() {
    await client.connect();
  
    for (const store of storeData) {
      const insertQuery = `
        INSERT INTO stores (name, url, district, city, year, visitors)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
  
      // Provide values: use defaults if some fields are missing
      const insertValues = [
        store.name,
        store.url,
        store.district,
        store.city || 'Jönköping',    // default city if not in JSON
        store.year || 2000,           // default year if not in JSON
        store.visitors || 0           // default visitors if not in JSON
      ];
  
      try {
        const res = await client.query(insertQuery, insertValues);
        console.log('Inserted record:', res.rows[0]);
      } catch (err) {
        console.error('Error inserting record', err.stack);
      }
    }
  
    await client.end();
  }
  
  insertStores();


app.get("/", (req, res) => {
    res.send("Haiiii");
});

app.use('/', express.static('public'));

// app.get('/api/stores')



app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
});

