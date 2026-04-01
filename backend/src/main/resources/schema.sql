ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;

UPDATE users SET active = TRUE WHERE active IS NULL;
UPDATE users SET created_at = NOW() WHERE created_at IS NULL;

CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

INSERT INTO roles (name)
VALUES ('ROLE_USER')
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ROLE_USER'
WHERE NOT EXISTS (
  SELECT 1
  FROM user_roles ur
  WHERE ur.user_id = u.id
    AND ur.role_id = r.id
);

CREATE TABLE IF NOT EXISTS stocks (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  stock_name VARCHAR(50) NOT NULL,
  purchase_price NUMERIC(18, 2) NOT NULL CHECK (purchase_price >= 0),
  current_price NUMERIC(18, 2) NOT NULL CHECK (current_price >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_stocks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_stocks_user_stock UNIQUE (user_id, stock_name)
);

CREATE INDEX IF NOT EXISTS idx_stocks_user_id ON stocks(user_id);

CREATE TABLE IF NOT EXISTS accounts (
  id BIGSERIAL PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(100),
  currency VARCHAR(10) NOT NULL DEFAULT 'TRY',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  user_id BIGINT NOT NULL,
  CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);

CREATE TABLE IF NOT EXISTS ipo_offerings (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  code VARCHAR(30) NOT NULL,
  company_name VARCHAR(255),
  offering_price NUMERIC(18, 2) NOT NULL CHECK (offering_price >= 0),
  current_price NUMERIC(18, 2) NOT NULL CHECK (current_price >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'TRY',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_ipo_offerings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_ipo_offerings_user_code UNIQUE (user_id, code)
);

CREATE INDEX IF NOT EXISTS idx_ipo_offerings_user_id ON ipo_offerings(user_id);

CREATE TABLE IF NOT EXISTS ipo_positions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  ipo_id BIGINT NOT NULL,
  account_id BIGINT NOT NULL,
  lot_count INTEGER NOT NULL CHECK (lot_count > 0),
  buy_price NUMERIC(18, 2) NOT NULL CHECK (buy_price >= 0),
  sale_price NUMERIC(18, 2),
  buy_date TIMESTAMP,
  sold_at TIMESTAMP,
  position_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  notes VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_ipo_positions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ipo_positions_ipo FOREIGN KEY (ipo_id) REFERENCES ipo_offerings(id) ON DELETE CASCADE,
  CONSTRAINT fk_ipo_positions_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  CONSTRAINT uq_ipo_positions_ipo_account UNIQUE (ipo_id, account_id)
);

CREATE INDEX IF NOT EXISTS idx_ipo_positions_user_id ON ipo_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_ipo_positions_ipo_id ON ipo_positions(ipo_id);

ALTER TABLE ipo_positions ADD COLUMN IF NOT EXISTS sale_price NUMERIC(18, 2);
ALTER TABLE ipo_positions ADD COLUMN IF NOT EXISTS sold_at TIMESTAMP;
ALTER TABLE ipo_positions ADD COLUMN IF NOT EXISTS position_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

UPDATE ipo_positions
SET position_status = 'ACTIVE'
WHERE position_status IS NULL;
