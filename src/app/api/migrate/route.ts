// Auto-migration endpoint: call this on deploy to sync DB schema.
// Runs ALL migration SQL from database.sql using exec_sql RPC.
// Requires SUPABASE_SERVICE_ROLE_KEY env var (already set for admin actions).
// Safe to call repeatedly — all statements use IF NOT EXISTS / IF EXISTS.

import { createServerClient } from "@supabase/ssr";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database.types";
import { rateLimit } from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

function getAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function parseStatements(sql: string): string[] {
  return sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"))
    .map((s) => s + ";");
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const { allowed, retryAfter } = rateLimit(`migrate:${ip}`, 5, 3600000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many migration attempts" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  try {
    const supabase = getAdminClient();
    const sqlPath = join(process.cwd(), "database.sql");
    const sql = readFileSync(sqlPath, "utf-8");
    const statements = parseStatements(sql);

    let success = 0;
    let skipped = 0;
    const errors: string[] = [];

    // First check if exec_sql exists
    const { error: execCheck } = await supabase.rpc("exec_sql", { query: "SELECT 1" });
    if (execCheck) {
      return NextResponse.json({
        status: "semi",
        message: "exec_sql function not found. Run database.sql manually once in Supabase SQL Editor.",
        hint: "Go to your Supabase dashboard → SQL Editor → paste and run database.sql",
        errors: [execCheck.message],
      });
    }

    for (const stmt of statements) {
      // Skip seed data (SELECT/INSERT) on repeated runs — they have ON CONFLICT DO NOTHING
      if (/^(SELECT|DROP TRIGGER|DROP FUNCTION)\b/i.test(stmt)) {
        skipped++;
        continue;
      }

      const { error } = await supabase.rpc("exec_sql", { query: stmt });
      if (error) {
        if (
          error.message?.toLowerCase().includes("already exists") ||
          error.message?.toLowerCase().includes("duplicate")
        ) {
          skipped++;
        } else {
          errors.push(`${stmt.slice(0, 80)}... → ${error.message}`);
        }
      } else {
        success++;
      }
    }

    return NextResponse.json({
      status: errors.length === 0 ? "ok" : "partial",
      statements: { total: statements.length, success, skipped, failed: errors.length },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}
