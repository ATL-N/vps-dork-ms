import { Pool } from "pg";

// SSL Configuration types
const SSL_CONFIGS = {
  DISABLE: false,
  ALLOW: {
    rejectUnauthorized: false,
  },
  REQUIRE: {
    rejectUnauthorized: true,
  },
  CUSTOM: (ca) => ({
    rejectUnauthorized: true,
    ca: ca, // Certificate Authority chain
  }),
};

let pool;

function createPool() {
  const environment = process.env.NODE_ENV || "development";
  const isDocker = process.env.DOCKER === "true";

  // Default SSL configuration based on environment
  let sslConfig = SSL_CONFIGS.DISABLE;

  if (environment === "production") {
    sslConfig = SSL_CONFIGS.REQUIRE;
  } else if (environment === "staging") {
    sslConfig = SSL_CONFIGS.ALLOW;
  } else if (isDocker && process.env.DB_SSL_CA) {
    // Custom SSL configuration for Docker with CA certificate
    sslConfig = SSL_CONFIGS.CUSTOM(process.env.DB_SSL_CA);
  }

  return new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || "5432"),
    ssl: sslConfig, // Fixed: You were setting ssl: false regardless of config
    // Additional recommended configurations
    max: parseInt(process.env.DB_POOL_MAX || "20"), // Reduced max connections
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Increased from 2000ms
  });
}

async function getPoolWithRetry(maxRetries = 5, initialDelay = 500) {
  if (pool) return pool;

  let retries = 0;
  let lastError;

  while (retries < maxRetries) {
    try {
      pool = createPool();
      // Test the connection
      const client = await pool.connect();
      client.release();
      console.log("Database connection established successfully");
      return pool;
    } catch (error) {
      lastError = error;
      retries++;
      // Don't log during tests
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          `Database connection attempt ${retries} failed: ${error.message}`
        );
      }

      // Exponential backoff
      const delay = initialDelay * Math.pow(2, retries - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // If we got here, all retries failed
  console.error(`Failed to connect to database after ${maxRetries} attempts`);
  throw lastError;
}

async function query(text, params) {
  const pool = await getPoolWithRetry();
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Graceful shutdown handler
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default {
  query,
  getPool: getPoolWithRetry,
  closePool,
};
