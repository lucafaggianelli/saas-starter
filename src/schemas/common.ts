import { z } from 'zod'

// DB primary key, i.e. an int for SQL DBs or an ObjectID for mongo
export const primaryKey = z.number().min(1).int()
export const baseProperties = ['id', 'createdAt', 'updatedAt']

export const idOnlySchema = z.object({
  id: primaryKey,
})
