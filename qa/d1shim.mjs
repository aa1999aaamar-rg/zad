// local test harness: the bundled Worker against an in-memory D1 (sql.js) and a Map-backed R2
import initSqlJs from '/tmp/zbt/node_modules/sql.js/dist/sql-wasm.js';
const SQL = await initSqlJs();
export function makeEnv() {
  const db = new SQL.Database();
  const conv = a => a.map(x => x === undefined ? null : typeof x === 'boolean' ? (x ? 1 : 0) : x);
  // D1 supports ?1 ?2 numbered params; sql.js supports them too via array binding
  class Stmt { constructor(sql) { this.sql = sql; this.args = []; } bind(...a) { this.args = conv(a); return this; }
    _exec() { const st = db.prepare(this.sql); st.bind(this.args); const rows = []; while (st.step()) rows.push(st.getAsObject()); st.free(); return rows; }
    async first(col) { const r = this._exec()[0] || null; return r && col ? r[col] : r; }
    async all() { return { results: this._exec(), success: true }; }
    async run() { const before = db.getRowsModified ? null : null; this._exec(); return { success: true, meta: { changes: db.getRowsModified() } }; } }
  const DB = { prepare: s => new Stmt(s), batch: async ss => { const out = []; db.exec('BEGIN'); try { for (const s of ss) out.push(await s.run()); db.exec('COMMIT'); } catch (e) { db.exec('ROLLBACK'); throw e; } return out; }, _db: db };
  const store = new Map();
  const VIDS = { async put(k, v, o) { let b = v; if (v instanceof ArrayBuffer) b = new Uint8Array(v); else if (v && v.getReader) { b = new Uint8Array(await new Response(v).arrayBuffer()); } store.set(k, { b, ct: o && o.httpMetadata && o.httpMetadata.contentType }); },
    async get(k) { const o = store.get(k); if (!o) return null; return { body: o.b, size: o.b.length, httpEtag: 'x', writeHttpMetadata: h => o.ct && h.set('content-type', o.ct) }; },
    async head(k) { const o = store.get(k); return o ? { size: o.b.length } : null; }, async delete(k) { store.delete(k); }, _store: store };
  return { DB, VIDS, ASSETS: { fetch: () => new Response('asset') } };
}
