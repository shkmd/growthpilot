// Windows-only development adapter. Never included in the production Worker.
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
mkdirSync('.sites-runtime',{recursive:true});
const sqlite=new DatabaseSync('.sites-runtime/preview.sqlite');
sqlite.exec('PRAGMA foreign_keys = ON');
class Statement {
  values:unknown[]=[];
  constructor(private sql:string){}
  bind(...values:unknown[]){this.values=values;return this}
  async first(){return sqlite.prepare(this.sql).get(...this.values as any[])||null}
  async all(){return {results:sqlite.prepare(this.sql).all(...this.values as any[])}}
  async run(){const r=sqlite.prepare(this.sql).run(...this.values as any[]);return {success:true,meta:{changes:Number(r.changes)}}}
}
export const env={DB:{prepare:(sql:string)=>new Statement(sql)}};
