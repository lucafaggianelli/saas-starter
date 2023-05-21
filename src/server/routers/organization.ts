import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { router, publicProcedure } from '~/server/trpc'
import { prisma } from '~/server/prisma'
import { idOnlySchema, primaryKey } from '~/schemas/common'
import { addMemberSchema, createOrganizationSchema } from '~/schemas'

const defaultSelect = Prisma.validator<Prisma.OrganizationSelect>()({
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
})

export const organizationRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: primaryKey.nullish(),
      }),
    )
    .query(async ({ input }) => {
      /**
       * For pagination docs you can have a look here
       * @see https://trpc.io/docs/useInfiniteQuery
       * @see https://www.prisma.io/docs/concepts/components/prisma-client/pagination
       */

      const limit = input.limit ?? 50
      const { cursor } = input

      const items = await prisma.organization.findMany({
        select: {
          ...defaultSelect,
          _count: {
            select: {
              memberships: true,
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
  byId: publicProcedure
    .input(
      z.object({
        id: primaryKey,
      }),
    )
    .query(async ({ input }) => {
      const { id } = input
      const post = await prisma.organization.findUnique({
        where: { id },
        include: {
          memberships: { include: { user: true } },
        },
      })
      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No post with id '${id}'`,
        })
      }
      return post
    }),
  add: publicProcedure
    .input(createOrganizationSchema)
    .mutation(async ({ input }) => {
      const post = await prisma.organization.create({
        data: {
          ...input,
        },
        select: defaultSelect,
      })
      return post
    }),

  update: publicProcedure
    .input(createOrganizationSchema.merge(idOnlySchema))
    .mutation(async ({ input: { id, ...data } }) => {
      await prisma.organization.update({
        where: { id },
        data,
      })
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: primaryKey,
      }),
    )
    .mutation(async ({ input: { id } }) => {
      await prisma.organization.delete({
        where: { id },
      })
    }),

  addMember: publicProcedure
    .input(addMemberSchema)
    .mutation(async ({ input: { email, organizationId, role } }) => {
      const existingUser = await prisma.user.findFirst({
        where: { email },
        select: { email: true, id: true },
      })

      const data: Prisma.MembershipUncheckedCreateInput = {
        organizationId: organizationId,
        role,
      }

      if (existingUser) {
        data.userId = existingUser.id
      } else {
        // TODO send email invitation
        data.invitedEmail = email
      }

      const membership = await prisma.membership.create({ data })

      return membership
    }),

  deleteMember: publicProcedure
    .input(
      z.object({
        id: primaryKey,
      }),
    )
    .mutation(async ({ input: { id } }) => {
      await prisma.membership.delete({ where: { id } })
    }),

  listInvitedMembers: publicProcedure.query(async () => {
    return await prisma.membership.findMany({
      where: {
        userId: null,
      },
    })
  }),
})
