export const deleteProjectStatements=[
 'DELETE FROM google_search_sites WHERE project_id=? AND user_id=?',
 'DELETE FROM crawl_jobs WHERE project_id=? AND owner=?',
 'DELETE FROM audits WHERE project_id=? AND owner=?',
 'DELETE FROM tasks WHERE project_id=? AND owner=?',
 'DELETE FROM workspace_records WHERE project_id=? AND owner=?',
 'DELETE FROM google_project_connections WHERE project_id=? AND user_id=?',
 'DELETE FROM google_project_oauth_states WHERE project_id=? AND user_id=?',
 'DELETE FROM projects WHERE id=? AND owner=?'
];


