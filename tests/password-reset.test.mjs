import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {accountStatements} from '../lib/account-schema.ts';
test('reset rejects expired, reused and stale-password tokens',()=>{
 const db=new DatabaseSync(':memory:');db.exec('PRAGMA foreign_keys=ON');for(const sql of accountStatements)db.exec(sql);
 db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?,?)').run('u','test@example.com','Test','old','r','member','active','now');
 const insert=db.prepare('INSERT INTO password_resets VALUES (?,?,?,?)');insert.run('expired','u','old',1);insert.run('valid','u','old',9999);insert.run('other','u','old',9999);
 const source=readFileSync('app/api/password-reset/route.ts','utf8');
 const sql=source.match(/prepare\("(UPDATE users SET password=.*?)"\)/)[1];const update=db.prepare(sql);
 assert.equal(update.run('new','r','u','old','expired',100).changes,0);
 assert.equal(update.run('new','r','u','old','valid',100).changes,1);
 assert.equal(update.run('new2','r','u','old','valid',100).changes,0);
 assert.equal(update.run('new2','r','u','old','other',100).changes,0);
 assert.equal(db.prepare('SELECT password FROM users').get().password,'new');db.close();
});
