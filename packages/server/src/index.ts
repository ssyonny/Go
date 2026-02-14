import app from './app';
import { config } from './config';
import { testConnection } from './config/database';
import { connectRedis } from './config/redis';

async function start() {
  await testConnection();
  await connectRedis();

  app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
