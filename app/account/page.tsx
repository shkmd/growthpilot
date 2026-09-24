import AccountPanel from '../account-panel';
import {currentAccount} from '@/lib/accounts';
import {PageShell} from '../dashboard/page-shell';
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await currentAccount();
 // SQLite rows have a null prototype; client component props must be plain objects.
 return user?<PageShell active="settings"><AccountPanel initialUser={{...user}}/></PageShell>:<AccountPanel/>;
}
