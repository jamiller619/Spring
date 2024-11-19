/// <reference lib="deno.ns" />

import dotenv from 'npm:dotenv'
import process from 'node:process'
import { Options, UnsplashPhoto, photosType } from '../@types.ts'
import { createApi } from 'npm:unsplash-js'
import type { ApiResponse } from 'npm:unsplash-js/dist/helpers/response'
import type { Random } from 'npm:unsplash-js/dist/methods/photos/types'

dotenv.config({
  path: '../../.env',
})

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
})

const headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'cache-control',
  'access-control-allow-methods': 'GET, OPTIONS',
  'cache-control': `public, max-age=${process.env.PUBLIC_CACHE_TTL}, immutable`,
}

async function handleRequests(req: Request) {
  // If preflight request, exit early to prevent further work.
  if (req.method === 'OPTIONS') {
    return new Response('', {
      status: 200,
      headers,
    })
  }

  if (req.method !== 'GET') {
    throw new Error(`Invalid method!`)
  }

  const url = new URL(req.url)
  const params = Object.fromEntries(url.searchParams) as Options | undefined

  if (!params?.key || !params?.value) {
    throw new Error(`Missing required parameters!`)
  }

  if (!photosType.includes(params.key)) {
    throw new Error(`Invalid key parameter!`)
  }

  const res = await fetchPhotoBasedOnOptions(params)

  if (!res) {
    throw new Error(`Unable to retreive an API response!`)
  }

  if (res.type === 'error') {
    throw new Error(res.errors.join(' / '))
  }

  const { photo, downloadLocation } = parsePhoto(res.response)

  await unsplash.photos.trackDownload({ downloadLocation })

  return Response.json(photo, {
    headers,
  })
}

Deno.serve(
  {
    onError: function handleError(err) {
      return Response.json({
        message: (err as Error).message,
        status: 500,
      })
    },
  },
  handleRequests,
)

/**
 * Retreives a single image from the Unsplash API based on
 * the user's options. Additionally includes headers that
 * cache the image for an entire day.
 * @param options Extension's options object
 * @returns A single image
 */
function fetchPhotoBasedOnOptions(options: Options) {
  switch (options.key) {
    case 'collection': {
      return unsplash.photos.getRandom({
        collectionIds: [options.value],
      }) as Promise<ApiResponse<Random>>
    }

    case 'search': {
      return unsplash.photos.getRandom({
        query: options.value,
      }) as Promise<ApiResponse<Random>>
    }
  }
}

/**
 * Transforms an image returned from the Unsplash API, into
 * a common format that is used internally
 * @param data An image object from the Unsplash API
 * @returns An object with two properties, the UnsplashPhoto
 * object and a link used to track photo downloads
 */
function parsePhoto(data: Random) {
  const photo: UnsplashPhoto = {
    author: {
      name: data.user.name,
      link: data.user.links.html,
    },
    color: data.color,
    url: data.urls.raw,
  }

  return { photo, downloadLocation: data.links.download_location }
}
