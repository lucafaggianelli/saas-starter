import { GlobalRole, Membership, Organization } from '@prisma/client'
import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      role: GlobalRole
    } & DefaultSession['user']
    membership:
      | (Membership & {
          organization: Organization
        })
      | undefined
  }
}
