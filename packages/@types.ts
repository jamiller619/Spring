/**
 * The eventual goal here is to allow a random photo to be
 * grabbed from one of the following methods in Unsplash.
 * Requires the extension to have options. Currently, only
 * `collection` is supported.
 */
export const photosType = ['collection', 'search', 'topic', 'user'] as const
export type PhotosType = typeof photosType[number]

export type Options = {
  key: PhotosType
  value: string
}

export type UnsplashPhoto = {
  author: {
    name: string
    link: string
  }
  url: string
  color: string | null
}
