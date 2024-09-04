const pg = require('pg')
const client = new pg.Client(process.env.DATABASE_URL)

const express = require('express')
const app = express()
app.use(require('morgan')('dev'));
app.use(express.json());

const init = async() => {

    await client.connect();
    console.log('connected to database');

    let SQL = /*SQL*/ `
        DROP TABLE IF EXISTS flavors;
        CREATE TABLE flavors (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            is_favorite BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now()
        );
        INSERT INTO flavors (name, is_favorite) VALUES('vanilla', false);
        INSERT INTO flavors (name) VALUES('strawberry');
        INSERT INTO flavors (name, is_favorite) VALUES('pistachio', true);
    `;

    // Await query of table and seeded data to Client
    await client.query(SQL);
    console.log('tables created & data seeded');

    // Create port & ask express to listen for it
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`));
}

init();

// GET
app.get("/api/flavors", async (req, res, next) => {
    try {
      const SQL = `SELECT * from flavors ORDER BY created_at DESC`;
      const response = await client.query(SQL);
      res.send(response.rows);
    } catch (error) {
      next(error);
    }
  });
  
// POST
app.post("/api/flavors", async(req, res, next) => {
    try {
      const SQL = /*sql*/ `
        INSERT INTO flavors(name)
        VALUES($1)
        RETURNING *
      `;
      const response = await client.query(SQL, [req.body.name]);
      res.send(response.rows[0]);
    }
    catch(error){
      next(error);
    }
  });