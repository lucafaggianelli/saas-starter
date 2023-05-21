import { MembershipRole } from '@prisma/client'
import { z } from 'zod'

import { primaryKey } from './common'

// zod transforms
const lowerCase = (value: string) => value.toLowerCase()
const trim = (value: string) => value.trim()

export const createOrganizationSchema = z.object({
  name: z.string().min(3).transform(trim),
})

export const addMemberSchema = z.object({
  organizationId: primaryKey,
  role: z.nativeEnum(MembershipRole),
  email: z
    .string()
    .email()
    .transform((str) => str.toLowerCase().trim()),
})

export const createAttachmentSchema = z.object({
  fieldPath: z.string().min(3).transform(trim),
  name: z.string().min(3).transform(trim),
  type: z.string().min(3).transform(trim).transform(lowerCase),
  url: z.string().url().transform(trim),
  reportId: primaryKey,
})

export const getAttachmentUploadUrlSchema = z.object({
  name: z.string().min(3).transform(trim),
  reportId: primaryKey,
})

export const createAdminSchema = z.object({
  email: z
    .string()
    .email()
    .transform((str) => str.toLowerCase().trim()),
})
