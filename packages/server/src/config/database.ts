import { Pool } from 'pg';
import { config } from './index';

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  max: 10,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    client.release();
    console.log('Database connected successfully');
    return true;
  } catch (err) {
    console.error('Database connection failed:', err);
    return false;
  }
}
