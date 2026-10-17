import pg from "pg";

let pool;
export function database() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!pool) {
    pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      max: 10,
      connectionTimeoutMillis: 4000,
      idleTimeoutMillis: 10000,
      application_name: "devacademy-web",
    });
    pool.on("error", () => { /* Idle errors must not crash a request; never log secrets. */ });
  }
  return pool;
}

// Transactions use one checked-out connection. Never send a BEGIN to pool.query().
export async function transaction(work) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const value = await work(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch { /* original error wins */ }
    throw error;
  } finally { client.release(); }
}
