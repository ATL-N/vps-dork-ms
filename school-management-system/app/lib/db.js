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
    ssl: false,
    // Additional recommended configurations
    max: parseInt(process.env.DB_POOL_MAX || "40"), // Maximum number of clients
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
  });
}

function getPool() {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

async function query(text, params) {
  const client = await getPool().connect();
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
  getPool,
  closePool,
};
