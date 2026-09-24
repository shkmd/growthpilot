export const claimCrawlSQL="UPDATE crawl_jobs SET lease=?,lease_until=? WHERE project_id=? AND owner=? AND status='running' AND lease_until<?";
export const saveCrawlSQL="UPDATE crawl_jobs SET state=?,status=?,lease='',lease_until=0,message='',updated_at=? WHERE project_id=? AND owner=? AND lease=? AND status='running'";
export const insertCrawlAuditSQL="INSERT INTO audits(id,project_id,owner,created_at,score,result) SELECT ?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM crawl_jobs WHERE project_id=? AND owner=? AND lease=? AND status='running')";
