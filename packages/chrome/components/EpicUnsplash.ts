/// <reference lib="DOM" />

import { Options, PhotosType, UnsplashPhoto } from '../../@types'

const style = document.createElement('style')

style.textContent = /*css*/ `
  img {
    position: absolute;
    inset: 0;
    animation: fadeIn 1.2s 0.5s both;
  }

  a {
    color: currentColor;
  }

  span {
    color: white;
    opacity: 0.8;
    line-height: normal;
    position: absolute;
    bottom: 0;
    left: 0;
    margin: 1rem;
    font-size: 0.88em;
    transition: opacity 200ms;
    animation: fadeIn 600ms 250ms backwards;

    &:hover {
      opacity: 1;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

class EpicUnsplash extends HTMLElement {
  img = document.createElement('img')
  attrib = document.createElement('span')

  get options(): Options {
    return {
      key: this.getAttribute('key') as PhotosType,
      value: this.getAttribute('value') as string,
    }
  }

  async connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.shadowRoot?.append(style, this.img, this.attrib)

    const data = await fetchPhoto(this.options)

    localStorage.setItem('data', JSON.stringify(data))

    this.createAttrib(data)

    const backgroundColor = data?.color ?? 'white'

    document.body.style.backgroundColor = backgroundColor

    const sizeImage = () => {
      if (data?.url) {
        const src = addResizeParams(data.url)

        this.img.src = src
      }
    }

    sizeImage()

    globalThis.addEventListener('resize', sizeImage)
  }

  createAttrib(data?: UnsplashPhoto) {
    const unsplashLink = document.createElement('a')

    unsplashLink.href = createUnsplashLink()
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

/**
 * Creates a link back to Unsplash, specific to this
 * extension
 * @param host The Unsplash host
 * @returns The link string
 */
function createUnsplashLink(host: string = 'https://unsplash.com') {
  const url = new URL(host)
  const params = new URLSearchParams({
    utm_source: 'spring',
    utm_medium: 'referral',
  })

  return `${url}?${params}`
}

/**
 * Creates an image URL with parameters that resize the
 * image based on the browser's current viewport. Keeps any
 * image parameters already in the URL.
 * @param url The Unsplash image URL
 * @returns A new Unsplash URL
 */
function addResizeParams(url: string) {
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

async function fetchPhoto(options: Options) {
  const url = new URL(import.meta.env.PUBLIC_PROXY_URL)
  const params = new URLSearchParams(options)

  const res = await fetch(`${url}?${params}`, {
    headers: {
      'cache-control': `max-age=${import.meta.env.PUBLIC_CACHE_TTL}`,
    },
  })

  const data = await res.json()

  return data as UnsplashPhoto
}
