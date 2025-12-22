import { Pool, type QueryResultRow } from "pg";
import { env } from "../env";

export const db = new Pool({
  connectionString: env.DATABASE_URL,
});

export async function query<R extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: any[] = [],
): Promise<R[]> {
  const res = await db.query<R>(sql, params);
  return res.rows;
}

export async function execute(
  sql: string,
  params: any[] = [],
): Promise<number> {
  const res = await db.query(sql, params);
  return res.rowCount ?? 0;
}
