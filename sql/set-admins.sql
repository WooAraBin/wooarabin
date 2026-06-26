-- 관리자 계정 지정: dogeunk@gmail.com, joara213@gmail.com
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- (users 테이블은 이메일 UNIQUE. 이미 로그인한 적 있으면 UPDATE, 없으면 INSERT 됩니다)

INSERT INTO users (email, name, role)
VALUES
  ('dogeunk@gmail.com', '관리자', 'admin'),
  ('joara213@gmail.com', '관리자', 'admin')
ON CONFLICT (email)
DO UPDATE SET role = 'admin';

-- 확인
SELECT email, name, role FROM users WHERE email IN ('dogeunk@gmail.com', 'joara213@gmail.com');
