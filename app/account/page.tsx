import AccountPanel from '../account-panel';
import {currentAccount} from '@/lib/accounts';
export const dynamic='force-dynamic';
export default async function Page(){
 const user=await currentAccount();
 // SQLite rows have a null prototype; client component props must be plain objects.
 return <AccountPanel initialUser={user?{...user}:null}/>;
}
