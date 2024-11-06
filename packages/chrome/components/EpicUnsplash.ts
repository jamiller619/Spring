import { createApi } from 'unsplash-js'
import type { Random } from 'unsplash-js/dist/methods/photos/types'

const unsplash = createApi({
  apiUrl: import.meta.env.PUBLIC_PROXY_URL,
})

type PhotosType = 'collection' | 'search' | 'topic' | 'user'

type UnsplashPhoto = {
  author: {
    name: string
    link: string
  }
  url: string
  color: string | null
}

type Options = {
  key: PhotosType
  id: string
}

class EpicUnsplash extends HTMLElement {
  img = document.createElement('img')
  attrib = document.createElement('span')
  key!: string
  keyid!: string

  get options(): Options {
    return {
      id: this.getAttribute('keyid') as string,
      key: this.getAttribute('key') as PhotosType,
    }
  }

  async connectedCallback() {
    this.attachShadow({ mode: 'open' })

    const style = document.createElement('style')
    const data = await fetchPhoto(this.options)
    const backgroundColor = data?.color ?? 'white'

    style.textContent = /*css*/ `
      img {
        position: absolute;
        inset: 0;
        background-color: ${backgroundColor};
      }

      a {
        color: white;
        text-decoration: none;
      }

      span {
        color: rgb(255 255 255 / 0.5);
        line-height: normal;
        position: absolute;
        top: 0;
        right: 0;
        background-color: ${backgroundColor};
        padding: 0.5em 0.6em;
        border-bottom-left-radius: 0.3em;
        font-size: 0.85em;
        font-weight: 300;
      }
    `

    this.createAttrib(data)
    this.shadowRoot?.append(style, this.img, this.attrib)

    const sizeImage = () => {
      if (data?.url) {
        const src = parseURL(data.url)

        this.img.src = src
      }
    }

    sizeImage()

    globalThis.addEventListener('resize', sizeImage)
  }

  createAttrib(data?: UnsplashPhoto) {
    const unsplashLink = document.createElement('a')

    unsplashLink.href = createUnsplashLink('https://unsplash.com')
    unsplashLink.innerText = 'Unsplash'

    const photographerLink = document.createElement('a')

    if (data?.author) {
      photographerLink.href = createUnsplashLink(data.author.link)
      photographerLink.innerText = data.author.name
    }

    this.attrib.append(
      document.createTextNode('Photo by '),
      photographerLink,
      document.createTextNode(' on '),
      unsplashLink,
    )
  }
}

customElements.define('epic-unsplash', EpicUnsplash)

function createUnsplashLink(host: string) {
  const url = new URL(host)
  const params = new URLSearchParams({
    utm_source: 'spring',
    utm_medium: 'referral',
  })

  return `${url}?${params}`
}

function parseURL(url: string) {
  const params = new URLSearchParams({
    fit: 'crop',
    w: String(globalThis.innerWidth),
    h: String(globalThis.innerHeight),
  })

  if (url.includes('?')) {
    return `${url}&${params}`
  }

  return `${url}?${params}`
}

function parsePhoto(data: Random) {
  const photo: UnsplashPhoto = {
    author: {
      name: data.user.name,
      link: data.user.links.html,
    },
    color: data.color,
    url: data.urls.raw,
  }

  return photo
}

async function fetchPhoto(options: Options, prevImageId?: string) {
  const res = await unsplash.photos.getRandom({
    collectionIds: [options.id]
  }, {
    headers: {
      'cache-control': `max-age=${import.meta.env.PUBLIC_CACHE_TTL}`
    }
  })

  if (res.type === 'error') {
    throw new Error(res.errors.join(' / '))
  }

  return parsePhoto(res.response as Random)
}
