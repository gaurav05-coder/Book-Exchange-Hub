import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@mnnit.ac.in" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectToDatabase();
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }
        
        // Check if email is from mnnit.ac.in domain
        if (!credentials.email.endsWith('@mnnit.ac.in')) {
          throw new Error('Only @mnnit.ac.in email addresses are allowed');
        }
        
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        if (!user) {
          throw new Error('Invalid email or password');
        }
        
        const isMatch = await user.matchPassword(credentials.password);
        
        if (!isMatch) {
          throw new Error('Invalid email or password');
        }
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user = {
          ...session.user,
          id: token.id as string
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'a-very-secure-secret-that-should-be-changed'
}; 