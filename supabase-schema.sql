-- Supabase SQL Editor에서 실행하세요

-- 사용자 테이블 (role 관리)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 의뢰 테이블
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT,
  project_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget TEXT,
  deadline TEXT,
  reference_url TEXT,
  status TEXT DEFAULT 'received'
    CHECK (status IN ('received', 'reviewing', 'quoted', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 관리자 계정 등록 (이메일 변경 후 실행)
-- INSERT INTO users (email, name, role) VALUES ('dogeunk@gmail.com', '관리자', 'admin');

-- RLS 비활성화 (서비스 role key로만 접근하므로 불필요)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries DISABLE ROW LEVEL SECURITY;
