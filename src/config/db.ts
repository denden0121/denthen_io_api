import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT NOW()')
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Database connection error:', err.stack));

export default pool;
