import NextAuth from 'next-auth';
import { authOptions } from './options';

// Export the handler as named functions GET and POST
// This is the standard Next.js API route handler pattern
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 