import process from 'node:process'

const BASE_URL = 'https://api.unsplash.com'
const CACHE_TTL = process.env.PUBLIC_CACHE_TTL

export default function UnsplashProxy(accessKey: string) {
  return async function handle(req: Request): Promise<Response> {
    const requestedURL = new URL(req.url)
    const url = `${BASE_URL}${requestedURL.pathname}${requestedURL.search}`
    const proxiedRequest = new Request(url, {
      headers: {
        // https://unsplash.com/documentation#version
        'accept-version': 'v1',
        // https://unsplash.com/documentation#public-authentication
        authorization: `Client-ID ${accessKey}`,
      },
    })

    const data = await fetch(proxiedRequest)
    const json = await data.json()

    const resp = new Response(JSON.stringify(json), {
      status: data.status,
      statusText: data.statusText,
      headers: {
        ...data.headers,
        'access-control-allow-origin': 'http://localhost:5173',
        'access-control-allow-headers': 'accept-version, cache-control, access-control-allow-headers, authorization, x-requested-with',
        'cache-control': `public, max-age=${CACHE_TTL}, immutable`,
        'content-type': 'application/json',
      }
    })

    return resp
  }
}
