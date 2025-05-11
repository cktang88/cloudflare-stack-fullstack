DROP TABLE IF EXISTS todos;
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add some seed data
INSERT INTO todos (text) VALUES ('Learn Cloudflare Workers');
INSERT INTO todos (text, completed) VALUES ('Build a Fullstack App', 0);
INSERT INTO todos (text) VALUES ('Deploy to Cloudflare'); 