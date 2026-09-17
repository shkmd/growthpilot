// SQLite adapter for local previews and the Railway Node deployment.
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
const dataDirectory=process.env.GROWTHPILOT_DATA_DIR||'.sites-runtime';
mkdirSync(dataDirectory,{recursive:true});
const sqlite=new DatabaseSync(dataDirectory+'/preview.sqlite');
sqlite.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000');
sqlite.exec('PRAGMA foreign_keys = ON');
sqlite.exec(`
CREATE TABLE IF NOT EXISTS workspace_records (
 id TEXT PRIMARY KEY NOT NULL, owner TEXT NOT NULL, project_id TEXT NOT NULL REFERENCES projects(id),
 kind TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS records_owner_project ON workspace_records(owner,project_id);
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY NOT NULL,
  owner TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  country TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TEXT NOT NULL
);
DROP INDEX IF EXISTS projects_owner_free_quota;
CREATE INDEX IF NOT EXISTS projects_owner ON projects(owner);
CREATE TABLE IF NOT EXISTS audits (
  id TEXT PRIMARY KEY NOT NULL,
  project_id TEXT NOT NULL,
  owner TEXT NOT NULL,
  created_at TEXT NOT NULL,
  score INTEGER NOT NULL,
  result TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
CREATE INDEX IF NOT EXISTS audits_owner_project_date ON audits(owner, project_id, created_at);
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY NOT NULL,
  owner TEXT NOT NULL,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  priority TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
CREATE INDEX IF NOT EXISTS tasks_owner_project ON tasks(owner, project_id);
CREATE UNIQUE INDEX IF NOT EXISTS tasks_deduplicate ON tasks(project_id, title);
CREATE TABLE IF NOT EXISTS audit_limits (
  owner TEXT PRIMARY KEY NOT NULL,
  last_started INTEGER NOT NULL,
  day TEXT NOT NULL,
  count INTEGER NOT NULL
);`);
class Statement {
  values:unknown[]=[];
  constructor(private sql:string){}
  bind(...values:unknown[]){this.values=values;return this}
  async first(){return sqlite.prepare(this.sql).get(...this.values as any[])||null}
  async all(){return {results:sqlite.prepare(this.sql).all(...this.values as any[])}}
  async run(){const r=sqlite.prepare(this.sql).run(...this.values as any[]);return {success:true,meta:{changes:Number(r.changes)}}}
}
export const env={DB:{prepare:(sql:string)=>new Statement(sql)}};
