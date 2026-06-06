import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Kakao from 'next-auth/providers/kakao'
import { getSupabaseAdmin } from '@/lib/supabase'

const NaverProvider = {
  id: 'naver',
  name: 'Naver',
  type: 'oauth',
  authorization: 'https://nid.naver.com/oauth2.0/authorize',
  token: 'https://nid.naver.com/oauth2.0/token',
  userinfo: 'https://openapi.naver.com/v1/nid/me',
  profile(profile) {
    return {
      id: profile.response.id,
      name: profile.response.name,
      email: profile.response.email,
      image: profile.response.profile_image,
    }
  },
  clientId: process.env.NAVER_CLIENT_ID,
  clientSecret: process.env.NAVER_CLIENT_SECRET,
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
    }),
    NaverProvider,
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.provider = token.provider
        session.user.role = token.role || 'user'
      }
      return session
    },
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider
        // 로그인 시 users 테이블에 upsert (신규 가입 자동 저장)
        const { data, error } = await getSupabaseAdmin()
          .from('users')
          .upsert(
            { email: token.email, name: token.name, provider: account.provider, last_login: new Date().toISOString() },
            { onConflict: 'email' }
          )
          .select('role')
          .single()
        if (error) console.error('User upsert error:', error.message, error.code)
        token.role = data?.role || 'user'
      }
      return token
    },
  },
})
