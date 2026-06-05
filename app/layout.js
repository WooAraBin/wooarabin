import './globals.css'

export const metadata = {
  title: '우아라빈 — Web & App Development',
  description: '웹·앱 개발, AI 서비스 구축 전문. 아이디어를 현실로 만들어드립니다.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
