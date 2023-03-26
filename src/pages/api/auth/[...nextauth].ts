import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { GlobalRole } from '@prisma/client'
import NextAuth, { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import getConfig from 'next/config'

import { prisma } from '~/server/prisma'

/**
 * Check if the user has been invited
 *
 * @param email
 * @returns true if invited, false otherwise
 */
const getUserInvitations = async (email: string) => {
  return await prisma.$transaction([
    prisma.membership.findMany({
      where: { invitedEmail: email },
    }),

    prisma.adminInvitation.findFirst({
      where: { invitedEmail: email },
    }),
  ])
}

const {
  serverRuntimeConfig: { googleClientId, googleClientSecret },
} = getConfig()

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    EmailProvider({
      server: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'virgil72@ethereal.email',
          pass: 'WTxMetUF1yNnKQ4SyZ',
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ profile, account, user }) {
      let email: string | undefined

      if (account?.type === 'oauth') {
        // In case the user exists, accept the signin.
        // `user` is a DB record
        if ((user as any).role && (user as any).createdAt) {
          return true
        }

        email = profile?.email
      } else if (account?.type === 'email') {
        // In case the user exists, accept the signin.
        // `user` is a DB record
        if ((user as any).emailVerified) {
          return true
        }

        email = account.providerAccountId
      } else {
        throw new Error(`Unsupported auth type ${account?.type}`)
      }

      // If we arrive here, the user didn't signin ever before
      // so we need to check if they've been invited

      if (!email) {
        console.error(`The user doesn't have an email address, ${profile}`)
        return false
      }

      const invitations = await getUserInvitations(email)
      const isInvited = invitations[0].some((inv) => !!inv) || !!invitations[1]

      return isInvited
    },
    async session({ session }) {
      if (!session.user) {
        throw new Error('Session with no user')
      }

      if (!session.user.email) {
        throw new Error('Session user with no email')
      }

      const invitations = await getUserInvitations(session.user.email)
      const hasOrgInvitations = invitations[0].some((inv) => !!inv)

      const user = await prisma.user.findFirstOrThrow({
        where: { email: session.user.email },
        include: {
          memberships: { include: { organization: true } },
        },
      })

      // Has been invited as admin
      if (invitations[1]) {
        await prisma.$transaction([
          // Update user role
          prisma.user.update({
            where: {
              email: session.user.email,
            },
            data: {
              role: GlobalRole.SUPERADMIN,
            },
          }),
          // Delete invitation
          prisma.adminInvitation.delete({
            where: { id: invitations[1].id },
          }),
        ])

        user.role = GlobalRole.SUPERADMIN
      } else if (hasOrgInvitations) {
        const transactions = invitations[0].map((membership) => {
          return prisma.membership.update({
            where: {
              id: membership.id,
            },
            include: {
              organization: true,
            },
            data: {
              invitedEmail: null,
              invitedName: null,
              userId: user.id,
            },
          })
        })

        user.memberships = await prisma.$transaction(transactions)
      }

      session.user.role = user.role
      session.membership = user.memberships[0]

      if (!session.membership && user.role !== GlobalRole.SUPERADMIN) {
        throw new Error(
          `The user ${session.user.email} should have an org membership`,
        )
      }

      return session
    },
  },
}

export default NextAuth(authOptions)
