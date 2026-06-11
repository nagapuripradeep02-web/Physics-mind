-- ============================================================================
-- execute_sql RPC — SELECT-only SQL probe executor
-- ----------------------------------------------------------------------------
-- WHY: The engine_bug_queue "run_probe" admin feature
--      (src/app/api/admin/bug-queue-action/route.ts → runProbeSql) calls
--      supabaseAdmin.rpc('execute_sql', { sql }). That RPC was never deployed,
--      so the probe degraded to "here is the SQL, paste it yourself". This
--      migration deploys the missing function so SQL probes actually run.
--
-- SECURITY POSTURE (read before applying):
--   - SELECT-only: a defense-in-depth guard rejects anything not starting with
--     SELECT, and rejects multi-statement input (no ';' chaining). The calling
--     TS code ALSO enforces SELECT-only — this is the second layer.
--   - security INVOKER (not DEFINER): runs with the caller's privileges. The
--     only caller is the server-side service_role client, which already has
--     full read access — so there is no privilege escalation here.
--   - EXECUTE is REVOKED from public / anon / authenticated and GRANTED only to
--     service_role. Browser clients cannot call it.
--   - Returns rows as a JSON array (json_agg), matching what runProbeSql expects.
--
-- Apply in the Supabase SQL editor (project dxwpkjfypzxrzgbevfnx).
-- ============================================================================

create or replace function public.execute_sql(sql text)
returns json
language plpgsql
security invoker
as $$
declare
    result   json;
    cleaned  text := lower(ltrim(sql));
    trimmed  text := rtrim(sql, ' ;' || chr(10) || chr(13) || chr(9));
begin
    -- Guard 1: must be a single SELECT.
    if position('select' in cleaned) <> 1 then
        raise exception 'execute_sql: only SELECT statements are permitted';
    end if;

    -- Guard 2: no statement chaining. After stripping trailing whitespace and
    -- semicolons, no ';' may remain anywhere in the body.
    if position(';' in trimmed) > 0 then
        raise exception 'execute_sql: multiple statements are not permitted';
    end if;

    -- Wrap as a subquery so only a valid SELECT can run, and aggregate to JSON.
    execute 'select coalesce(json_agg(t), ''[]''::json) from (' || trimmed || ') t'
        into result;

    return result;
end;
$$;

revoke all     on function public.execute_sql(text) from public;
revoke all     on function public.execute_sql(text) from anon;
revoke all     on function public.execute_sql(text) from authenticated;
grant  execute on function public.execute_sql(text) to   service_role;

comment on function public.execute_sql(text) is
    'SELECT-only SQL probe executor for engine_bug_queue run_probe. service_role only. See supabase_2026-05-26_execute_sql_rpc_migration.sql.';
