import Workspace from './suite-workspace';
import {currentAccount} from '@/lib/accounts';
import AccountPanel from './account-panel';
export const dynamic='force-dynamic';
export default async function Home(){const user=await currentAccount();return user?<Workspace signedIn/>:<AccountPanel/>}
