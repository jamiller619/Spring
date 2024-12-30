export const photosType = ['collection', 'search', 'topic', 'user'] as const
export type PhotosType = (typeof photosType)[number]

export type Options = {
  'unsplash.photo.type': PhotosType
  'unsplash.photo.value': string
  'datetime.display': boolean
  'clock.hours.color': string
  'clock.minutes.color': string
}

export type UnsplashPhoto = {
  author: {
    name: string
    link: string
  }
  url: string
  color: string | null
}
