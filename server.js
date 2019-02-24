'use-strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const bodyParser = ('body-parser');
const superagent = require('superagent');

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

const client = new pg.Client(process.env.DATABASE_URL);

client.connect();
client.on('error', err=> console.error(err));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

if (client.query(`SELECT COUNT (*) FROM seattle;`) < 1) {
  let url = 'https://data.seattle.gov/resource/2ey2-escs.json';
  superagent.get(url)
    .then(data => {
      data.body.forEach(object => {
        client.query(`INSERT INTO seattle (location, dates, projectname, url, description) 
        VALUES ($1, $2, $3, $4, $5)`,
        [object.location,
          object.dates,
          object.projectname,
          object.url,
          object.description]),
        err => console.error(err);
      });
    });
}

app.get('/projects/seattle', (req, res) => {
  client.query(`SELECT location, dates, projectname, url, description FROM seattle;`)
    .then(results => res.send(results.rows))
    .catch(console.err);
});

app.get('/', (req,res) => res.redirect(CLIENT_URL));
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));