require('dotenv').config();
const app = require('./app');
const { PORT, NODE_ENV } = require('./config');

app.listen(PORT, () => console.log(`Server running in ${NODE_ENV} on ${PORT}`));

const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: process.env.DB_URL
});

app.set('db', db);