// redis.js
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("Missing REDIS_URL environment variable");
}
const kv = new Redis(redisUrl, {
  connectTimeout: 5000, // 5 seconds
  reconnectOnError: (err) => {
    // Only reconnect when the error is not a fatal error
    if (err.message.startsWith("READONLY")) {
      return false;
    }
    return true;
  },
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 500); // ms
    return delay;
  },
});

export default kv;
