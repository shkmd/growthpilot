export const accountStatements = [
 `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, password TEXT NOT NULL, recovery TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL)`,
 `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires INTEGER NOT NULL, created_at TEXT NOT NULL)`,
 `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
 `CREATE TABLE IF NOT EXISTS auth_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL)`
 ,`CREATE TABLE IF NOT EXISTS google_connections (user_id TEXT PRIMARY KEY REFERENCES users(id), access_token TEXT NOT NULL, refresh_token TEXT NOT NULL, expires_at INTEGER NOT NULL, property_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`
 ,`CREATE TABLE IF NOT EXISTS google_oauth_states (state TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL)`
 ,`CREATE TABLE IF NOT EXISTS google_project_connections (user_id TEXT NOT NULL, project_id TEXT NOT NULL, access_token TEXT NOT NULL, refresh_token TEXT NOT NULL, expires_at INTEGER NOT NULL, property_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY(user_id,project_id))`
,`CREATE TABLE IF NOT EXISTS google_project_oauth_states (state TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), project_id TEXT NOT NULL, expires_at INTEGER NOT NULL)`
];

