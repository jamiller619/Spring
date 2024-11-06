import dotenv from 'npm:dotenv'
import UnsplashProxy from './unsplash-proxy.ts'
import process from 'node:process'

dotenv.config({
  path: '../../.env'
})

const handler = UnsplashProxy(process.env.UNSPLASH_ACCESS_KEY)

function errorHandler(err: unknown) {
  return Response.json({
    message: (err as Error).message,
    status: 500,
  })
}

Deno.serve({
  onError: errorHandler,
}, handler)
