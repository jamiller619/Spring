/// <reference lib="deno.ns" />

import dotenv from 'npm:dotenv'
import process from 'node:process'
import { Options, UnsplashPhoto, photosType } from '../@types.ts'
import { createApi } from 'npm:unsplash-js'
import type { ApiResponse } from 'npm:unsplash-js/dist/helpers/response'
import type { Random } from 'npm:unsplash-js/dist/methods/photos/types'
import * as log from 'jsr:@std/log'

dotenv.config({
  path: '../../.env',
})

log.setup({
  handlers: {
    default: new log.ConsoleHandler('DEBUG', {
      formatter: (record) =>
        `${record.datetime} [${record.levelName}] ${record.msg} ${JSON.stringify(record.args, null, 2)}`,
      useColors: true,
    }),
  },
})

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
})

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Cache-Control',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': `public, max-age=${process.env.PUBLIC_CACHE_TTL}`,
}

type APIOptions = Pick<Options, 'unsplash.photo.type' | 'unsplash.photo.value'>

Deno.serve(
  {
    onError: function handleError(err) {
      log.error((err as Error).message, err as Error)

      return Response.json({
        message: (err as Error).message,
        status: 500,
      })
    },
  },
  handleRequests,
)

async function handleRequests(req: Request) {
  // If preflight request, exit early to prevent further work.
  if (req.method === 'OPTIONS') {
    log.info(`OPTIONS to ${req.url}`)

    return new Response('', {
      status: 200,
      headers,
    })
  }

  if (req.method !== 'GET') {
    throw new Error(`Invalid HTTP method "${String(req.method)}"!`)
  }

  log.info(`GET ${req.url}`)

  const url = new URL(req.url)
  const params = Object.fromEntries(url.searchParams) as
    | Partial<APIOptions>
    | undefined

  if (!params?.['unsplash.photo.type'] || !params?.['unsplash.photo.value']) {
    throw new Error(`Missing required parameters!`)
  }

  if (!photosType.includes(params['unsplash.photo.type'])) {
    throw new Error(`Invalid key parameter!`)
  }

  log.info(`${req.url} Calling Unsplash API`, params)

  const res = await fetchPhotoBasedOnOptions(params as APIOptions)

  if (!res) {
    throw new Error(`Unable to retreive an API response!`)
  }

  if (res.type === 'error') {
    throw new Error(res.errors.join(' / '))
  }

  const { photo, downloadLocation } = parsePhoto(res.response)

  await unsplash.photos.trackDownload({ downloadLocation })

  log.info(`${req.url} Tracked download`, downloadLocation)

  log.info(`${req.url} Returning photo`, photo)

  return Response.json(photo, {
    headers,
  })
}

/**
 * Retreives a single image from the Unsplash API based on
 * the user's options.
 * @param options Extension's options object
 * @returns A single image
 */
function fetchPhotoBasedOnOptions(options: APIOptions) {
  switch (options['unsplash.photo.type']) {
    case 'collection': {
      return unsplash.photos.getRandom({
        collectionIds: [options['unsplash.photo.value']],
      }) as Promise<ApiResponse<Random>>
    }

    case 'search': {
      return unsplash.photos.getRandom({
        query: options['unsplash.photo.value'],
      }) as Promise<ApiResponse<Random>>
    }

    case 'topic': {
      return unsplash.photos.getRandom({
        topicIds: [options['unsplash.photo.value']],
      }) as Promise<ApiResponse<Random>>
    }

    case 'user': {
      return unsplash.photos.getRandom({
        username: options['unsplash.photo.value'],
      }) as Promise<ApiResponse<Random>>
    }
  }
}

/**
 * Transforms an Unsplash API Image object into our Domain
 * Image object
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
