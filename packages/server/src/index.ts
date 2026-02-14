import app from './app';
import { config } from './config';
import { testConnection } from './config/database';
import { connectRedis } from './config/redis';

async function start() {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn('⚠️ Database connection failed - some features may not work');
    }
  } catch (err) {
    console.warn('⚠️ Could not connect to database:', err);
  }

  try {
    await connectRedis();
  } catch (err) {
    console.warn('⚠️ Redis connection failed:', err);
  }

  app.listen(config.port, () => {
    console.log(`✅ Server running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
