import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {validateRecord} from '../lib/suite.ts';
import {parseCsv} from '../lib/csv.ts';
import {keywordRows,suggestIdeas,coverage,researchBrief} from '../lib/keyword-research.ts';
test('keyword studio keeps latest market records and creates transparent ideas',()=>{
 const records=[
  {id:'old',kind:'keyword',data:{title:'seo',country:'US',language:'English',volume:'100',source:'Provider',date:'2026-01-01'},updated_at:'2026-01-01'},
  {id:'new',kind:'keyword',data:{title:'seo',country:'US',language:'English',volume:'150',source:'Provider',date:'2026-02-01'},updated_at:'2026-02-01'},
  {id:'other',kind:'keyword',data:{title:'seo',country:'GB',language:'English',volume:'999',source:'Provider',date:'2026-02-01'},updated_at:'2026-02-01'}
 ];
 assert.deepEqual(keywordRows(records,'US','English').map(r=>r.id),['new']);
 assert.deepEqual(suggestIdeas('technical seo','Questions').length,5);
 assert.deepEqual(coverage('seo',[{url:'https://example.com',title:'SEO guide',h1:['Introduction'],h2:[],description:''}]).map(x=>x.matches),[['Title']]);
 assert.match(researchBrief('seo',[],records.filter(r=>r.id==='new'),'US','English'),/volume 150/);
});
test('CSV parser handles quoted multiline content and rejects malformed quotes',()=>{
 assert.deepEqual(parseCsv('\uFEFFTitle,Content\r\n"A, B","Line 1\nLine ""2"""\r\n'),[['Title','Content'],['A, B','Line 1\nLine "2"']]);
 assert.throws(()=>parseCsv('Title\n"unterminated'));
 assert.throws(()=>parseCsv('Title\n"closed"junk'));
});
test('record validation rejects invalid metrics, unknown types, and unsafe source URLs',()=>{
 assert.throws(()=>validateRecord('rank',{title:'test',position:'-1',market:'Google US',date:'2026-09-16'}));
 assert.throws(()=>validateRecord('unknown',{title:'test'}));
 assert.throws(()=>validateRecord('review',{title:'Review',rating:'6',review:'Text',date:'2026-09-16'}));
 assert.throws(()=>validateRecord('competitor',{title:'Test',url:'javascript:alert(1)'}));
 assert.throws(()=>validateRecord('content',{title:'Missing body'}));
 assert.deepEqual(validateRecord('content',{title:' Draft ',body:'Actual content',secret:'discarded'}),{title:'Draft',keyword:'',body:'Actual content',notes:''});
});
test('suite migration preserves existing data and permits multiple projects',()=>{
 const d=new DatabaseSync(':memory:');d.exec('PRAGMA foreign_keys=ON');
 d.exec(readFileSync('drizzle/0000_magenta_epoch.sql','utf8'));
 const insert=d.prepare('INSERT INTO projects VALUES (?,?,?,?,?,?,?)');insert.run('one','owner','Original','https://example.com','US','English','now');
 d.exec(readFileSync('drizzle/0001_workspace_records.sql','utf8'));
 insert.run('two','owner','Second','https://example.org','US','English','now');
 assert.equal(d.prepare('SELECT COUNT(*) AS n FROM projects').get().n,2);
 d.prepare('INSERT INTO workspace_records VALUES (?,?,?,?,?,?,?)').run('r','owner','one','content','{}','now','now');
 assert.throws(()=>d.prepare('INSERT INTO workspace_records VALUES (?,?,?,?,?,?,?)').run('bad','owner','missing','content','{}','now','now'));
 assert.equal(d.prepare('SELECT name FROM projects WHERE id=?').get('one').name,'Original');d.close();
});
