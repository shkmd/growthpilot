import {currentAccount} from '@/lib/accounts';
import AccountPanel from '../account-panel';
import AnalyticsDashboard from '../analytics-dashboard';
export const dynamic='force-dynamic';
export default async function Analytics(){const user=await currentAccount();return user?<AnalyticsDashboard/>:<AccountPanel/>}
