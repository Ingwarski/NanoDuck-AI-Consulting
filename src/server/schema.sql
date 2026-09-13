CREATE TABLE IF NOT EXISTS nanoduck_sessions (
  id VARCHAR(128) PRIMARY KEY,
  owner_subject VARCHAR(255) NOT NULL,
  csrf_token VARCHAR(128) NOT NULL,
  consented_at VARCHAR(40) NULL,
  issued_at VARCHAR(40) NOT NULL,
  expires_at VARCHAR(40) NOT NULL,
  revoked_at VARCHAR(40) NULL,
  INDEX nanoduck_sessions_expiry (expires_at)
);

CREATE TABLE IF NOT EXISTS nanoduck_settings (
  owner_id VARCHAR(32) PRIMARY KEY,
  settings_json JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS nanoduck_conversations (
  id VARCHAR(128) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  deleted_at VARCHAR(40) NULL,
  INDEX nanoduck_conversations_updated (updated_at)
);

CREATE TABLE IF NOT EXISTS nanoduck_runs (
  id VARCHAR(128) PRIMARY KEY,
  conversation_id VARCHAR(128) NOT NULL,
  status VARCHAR(20) NOT NULL,
  generation INT NOT NULL,
  snapshot_json JSON NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  INDEX nanoduck_runs_conversation (conversation_id, created_at)
);

CREATE TABLE IF NOT EXISTS nanoduck_messages (
  id VARCHAR(128) PRIMARY KEY,
  conversation_id VARCHAR(128) NOT NULL,
  role VARCHAR(64) NOT NULL,
  recipient VARCHAR(64) NULL,
  ciphertext MEDIUMTEXT NOT NULL,
  iv VARCHAR(64) NOT NULL,
  tag VARCHAR(64) NOT NULL,
  sequence INT NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  sources_json JSON NOT NULL,
  UNIQUE KEY nanoduck_messages_sequence (conversation_id, sequence)
);

CREATE TABLE IF NOT EXISTS nanoduck_requests (
  conversation_id VARCHAR(128) NOT NULL,
  request_id VARCHAR(128) NOT NULL,
  message_id VARCHAR(128) NOT NULL,
  run_id VARCHAR(128) NOT NULL,
  PRIMARY KEY (conversation_id, request_id)
);
