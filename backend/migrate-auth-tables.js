/* ===========================================================
   FASE A (auth): tablas de credenciales y sesiones.
   - UserCredential: hash scrypt + metadata, separada de UserAuthorization
     para aislar secretos (1:1 por UserID).
   - UserSession: tokens opacos de sesión (se guarda SHA-256, nunca el
     token en claro) con expiración por inactividad (reemplaza CATimer).
   Uso: node migrate-auth-tables.js   (idempotente, IF NOT EXISTS)
   =========================================================== */
const db = require('./db');

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS UserCredential (
      UserID INT NOT NULL PRIMARY KEY,
      PasswordHash VARCHAR(255) NOT NULL COMMENT 'scrypt N=16384 phc string',
      FailedAttempts INT NOT NULL DEFAULT 0,
      LockedUntil DATETIME NULL,
      LastLoginAt DATETIME NULL,
      TimeStampCreated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      TimeStampUpdated DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_usercred_user FOREIGN KEY (UserID)
        REFERENCES UserAuthorization (UserID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS UserSession (
      SessionID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      UserID INT NOT NULL,
      TokenHash CHAR(64) NOT NULL COMMENT 'SHA-256 del token opaco',
      CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      LastSeenAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      ExpiresAt DATETIME NOT NULL,
      RevokedFlag CHAR(1) NOT NULL DEFAULT 'N',
      UserAgent VARCHAR(255) NULL,
      INDEX idx_session_token (TokenHash),
      INDEX idx_session_user (UserID),
      CONSTRAINT fk_usersess_user FOREIGN KEY (UserID)
        REFERENCES UserAuthorization (UserID)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Limpieza periódica la hace el endpoint (delete expired on login);
  // un EVENT opcional puede crearse por DBA.
  console.log('auth tables OK: UserCredential, UserSession');
}

migrate()
  .then(() => db.end ? db.end() : process.exit(0))
  .then(() => process.exit(0))
  .catch((err) => { console.error('migrate-auth-tables FAILED:', err.message); process.exit(1); });
