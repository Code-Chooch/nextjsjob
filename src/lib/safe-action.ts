import { auth } from '@clerk/nextjs/server'
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from 'next-safe-action'
import z from 'zod'

class SafeActionError extends Error {}

const unauthedActionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    })
  },
  // Can also be an async function.
  handleServerError(e) {
    // Log to console.
    console.error('Action error:', e.message)

    // In this case, we can use the 'SafeActionError` class to unmask errors
    // and return them with their actual messages to the client.
    if (e instanceof SafeActionError) {
      return e.message
    }

    // Every other error that occurs will be masked with the default message.
    return DEFAULT_SERVER_ERROR_MESSAGE
  },
}).use(async ({ next, clientInput, metadata }) => {
  // Enable action logging in non-production.
  if (process.env.NODE_ENV !== 'production') {
    console.log('LOGGING MIDDLEWARE')

    const startTime = performance.now()

    // Here we await the action execution.
    const result = await next()

    const endTime = performance.now()

    console.log('Result ->', result)
    console.log('Client input ->', clientInput)
    console.log('Metadata ->', metadata)
    console.log('Action execution took', endTime - startTime, 'ms')

    // And then return the result of the awaited action.
    return result
  }
  return await next()
})

const authedActionClient = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    })
  },
  // Can also be an async function.
  handleServerError(e) {
    // Log to console.
    console.error('Action error:', e.message)

    // In this case, we can use the 'SafeActionError` class to unmask errors
    // and return them with their actual messages to the client.
    if (e instanceof SafeActionError) {
      return e.message
    }

    // Every other error that occurs will be masked with the default message.
    return DEFAULT_SERVER_ERROR_MESSAGE
  },
}).use(async ({ next, clientInput, metadata }) => {
  // get user auth data
  const { userId } = await auth()

  // throw error if no user id
  if (!userId) {
    throw new Error('User not authenticated.')
  }

  // Enable action logging in non-production.
  if (process.env.NODE_ENV !== 'production') {
    console.log('LOGGING MIDDLEWARE')

    const startTime = performance.now()

    // Here we await the action execution.
    const result = await next({ ctx: { userId } })

    const endTime = performance.now()

    console.log('Result ->', result)
    console.log('Client input ->', clientInput)
    console.log('Metadata ->', metadata)
    console.log('Action execution took', endTime - startTime, 'ms')

    // And then return the result of the awaited action.
    return result
  }

  return await next({ ctx: { userId } })
})

export { unauthedActionClient, authedActionClient, SafeActionError }
