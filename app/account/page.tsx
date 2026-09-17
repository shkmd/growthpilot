import AccountPanel from '../account-panel';
import {currentAccount} from '@/lib/accounts';
export const dynamic='force-dynamic';
export default async function Page(){return <AccountPanel initialUser={await currentAccount()}/>}
