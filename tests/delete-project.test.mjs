import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {deleteProjectStatements} from '../lib/delete-project.ts';
test('project deletion removes only the selected owners project data',()=>{
 const d=new DatabaseSync(':memory:');
 d.exec('CREATE TABLE projects(id TEXT,owner TEXT)');
 for(const table of ['audits','tasks','workspace_records','crawl_jobs'])d.exec(`CREATE TABLE ${table}(project_id TEXT,owner TEXT)`);
 for(const table of ['google_project_connections','google_project_oauth_states'])d.exec(`CREATE TABLE ${table}(project_id TEXT,user_id TEXT)`);
 for(const table of ['projects','audits','tasks','workspace_records','crawl_jobs','google_project_connections','google_project_oauth_states']){
  const s=d.prepare(`INSERT INTO ${table} VALUES (?,?)`);s.run('one','alice');s.run('two','alice');s.run('three','bob');
 }
 for(const sql of deleteProjectStatements)d.prepare(sql).run('one','bob');
 assert.equal(d.prepare('SELECT COUNT(*) AS n FROM projects').get().n,3);
 d.exec('BEGIN');for(const sql of deleteProjectStatements)d.prepare(sql).run('one','alice');d.exec('COMMIT');
 for(const table of ['projects','audits','tasks','workspace_records','crawl_jobs','google_project_connections','google_project_oauth_states'])assert.equal(d.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get().n,2);
 d.close();
});

