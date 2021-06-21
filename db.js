/** Database setup for BizTime. */

// Require PG, instead of pg.Client
const { Client } = require('pg');

let DB_URI;

// Set up seperate db for testing and one for development
if (process.env.NODE_ENV === 'test') {
  DB_URI = 'postgresql:///biztime_test';
} else {
  DB_URI = 'postgresql:///biztime';
}

let db = new Client({
  connectionString: DB_URI,
});

db.connect();

module.exports = db;
