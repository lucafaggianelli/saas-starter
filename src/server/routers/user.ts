import { z } from 'zod'

import { createAdminSchema } from '~/schemas'
import { prisma } from '~/server/prisma'
import { publicProcedure, router } from '~/server/trpc'
import { primaryKey } from '~/schemas/common'

export const userRouter = router({
  addAdmin: publicProcedure
    .input(createAdminSchema)
    .mutation(async ({ input }) => {
      return await prisma.adminInvitation.create({
        data: {
          invitedEmail: input.email,
        },
      })
    }),

  listAdmins: publicProcedure.query(async () => {
    return await prisma.adminInvitation.findMany()
  }),

  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: primaryKey.nullish(),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50
      const { cursor } = input

      const items = await prisma.user.findMany({
        include: {
          memberships: {
            include: {
              organization: true,
            },
          },
        },
        // get an extra item at the end which we'll use as next cursor
        take: limit + 1,
        where: {},
        cursor: cursor
          ? {
              id: cursor,
            }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      })
      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        // Remove the last item and use it as next cursor

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextItem = items.pop()!
        nextCursor = nextItem.id
      }

      return {
        items: items.reverse(),
        nextCursor,
      }
    }),
})
