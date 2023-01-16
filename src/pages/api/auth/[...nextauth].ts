import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import getConfig from 'next/config';

const {
  serverRuntimeConfig: { googleClientId, googleClientSecret },
} = getConfig();

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
};

export default NextAuth(authOptions);
