-- 의뢰 status에 '종결(cancelled)' 추가 허용
-- Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- (이 SQL을 실행해야 "종결 처리" 버튼이 동작합니다)

ALTER TABLE inquiries DROP CONSTRAINT IF EXISTS inquiries_status_check;

ALTER TABLE inquiries ADD CONSTRAINT inquiries_status_check
  CHECK (status IN (
    'received', 'reviewing', 'quoted', 'in_progress',
    'pending_payment', 'completed', 'cancelled'
  ));
