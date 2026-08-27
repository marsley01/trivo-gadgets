// scripts/migrate.js
// Auto-runs database.sql via Supabase's built-in exec_sql RPC.
// Uses SUPABASE_SERVICE_ROLE_KEY (already in your project).
// Runs automatically on every deploy via "vercel-build" in package.json.
//
// ONE-TIME SETUP (30 seconds):
// Go to Supabase Dashboard → SQL Editor → paste and run database.sql
// This creates the exec_sql() function. After that, this script runs
// automatically on every deploy with zero manual steps.

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const i = t.indexOf("=");
      if (i < 0) continue;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

function parseStatements(sql) {
  const statements = [];
  let currentStmt = '';
  let inDollarQuote = false;
  let inSingleQuote = false;
  let inLineComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || '';

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        currentStmt += char;
      }
      continue;
    }

    if (inSingleQuote) {
      currentStmt += char;
      if (char === "'") inSingleQuote = false;
      continue;
    }

    if (inDollarQuote) {
      currentStmt += char;
      if (char === '$' && nextChar === '$') {
        currentStmt += nextChar;
        i++;
        inDollarQuote = false;
      }
      continue;
    }

    if (char === '-' && nextChar === '-') {
      inLineComment = true;
      i++;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      currentStmt += char;
      continue;
    }

    if (char === '$' && nextChar === '$') {
      inDollarQuote = true;
      currentStmt += char + nextChar;
      i++;
      continue;
    }

    if (char === ';') {
      const trimmed = currentStmt.trim();
      if (trimmed) statements.push(trimmed + ';');
      currentStmt = '';
      continue;
    }

    currentStmt += char;
  }

  if (currentStmt.trim()) statements.push(currentStmt.trim() + ';');
  return statements;
}

async function run() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) { console.log("⚠️  NEXT_PUBLIC_SUPABASE_URL not set — skipping"); return; }
  if (!key) { console.log("⚠️  SUPABASE_SERVICE_ROLE_KEY not set — skipping"); return; }

  const sqlPath = path.join(__dirname, "..", "database.sql");
  if (!fs.existsSync(sqlPath)) { console.log("⚠️  database.sql not found — skipping"); return; }

  const sql = fs.readFileSync(sqlPath, "utf-8");
  const statements = parseStatements(sql);

  console.log(`📦 Running DB migration (${statements.length} statements)...`);

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // Check if exec_sql exists
  const { error: checkErr } = await supabase.rpc("exec_sql", { query: "SELECT 1" });
  if (checkErr) {
    console.log(`
⚠️  exec_sql() function not found.

To enable auto-migrations, run this ONCE in your Supabase SQL Editor:

  CREATE OR REPLACE FUNCTION public.exec_sql(query text)
  RETURNS void SECURITY DEFINER SET search_path = public LANGUAGE plpgsql AS
  \$\$ BEGIN EXECUTE query; END; \$\$;

Or just paste and run database.sql entirely — it does the same.
After that, migrations run automatically on every deploy.`);
    return;
  }

  let success = 0, skipped = 0, failed = 0;

  for (const stmt of statements) {
    if (/^(SELECT|DROP TRIGGER|DROP FUNCTION)\b/i.test(stmt)) { skipped++; continue; }
    const { error } = await supabase.rpc("exec_sql", { query: stmt });
    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("already exists") ||
          msg.includes("duplicate") ||
          msg.includes("must be owner") ||
          msg.includes("operator does not exist")) {
        skipped++;
      } else {
        console.log(`  ✗ ${stmt.slice(0, 70)}...`);
        console.log(`    ${error.message}`);
        failed++;
      }
    } else {
      success++;
    }
  }

  console.log(`✅ Migration: ${success} ok, ${skipped} skipped, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => { console.error("❌", err.message); process.exit(1); });
