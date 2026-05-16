const { createClient } = require('redis');

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: true,
    rejectUnauthorized: false,
    reconnectStrategy: () => 5000
  }
});

redisClient.on('error', (err) => {
  console.log('Redis Error:', err.message);
});

redisClient.on('connect', () => {
  console.log('Redis Connected');
});

(async () => {
  try {
    await redisClient.connect();
    console.log('Redis Ready');
  } catch (err) {
    console.log('Redis Connection Failed');
  }
})();

module.exports = redisClient;