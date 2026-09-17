// Local operator-only bootstrap. Register an account before running this command.
import {DatabaseSync} from 'node:sqlite';
const email=process.argv[2]?.trim().toLowerCase();
if(!email){console.error('Usage: node scripts/promote-admin.mjs email@example.com');process.exit(1)}
const db=new DatabaseSync('.sites-runtime/preview.sqlite');
const result=db.prepare("UPDATE users SET role='admin' WHERE email=? AND status='active'").run(email);
db.close();if(!result.changes){console.error('No active registered account with that email.');process.exit(1)}
console.log('Administrator access granted to the specified local account.');
