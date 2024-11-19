import getClockAngles from '../utils/getClockAngles'

const SVG_NS = 'http://www.w3.org/2000/svg'

const template = /*html*/ `
  <defs>
    <radialGradient id="dialfill" cx="0.75" cy="0.25" r="1">
      <stop offset="0%" stop-color="rgb(40 40 40)"></stop>
      <stop offset="100%" stop-color="rgb(25 25 25)"></stop>
    </radialGradient>
  </defs>
  <clipPath id="clip">
    <circle></circle>
  </clipPath>
  <foreignObject id="hours" width="100%" height="100%" clip-path="url(#clip)">
    <div style="width: 100%; height:100%"></div>
  </foreignObject>
  <foreignObject id="minutes" width="100%" height="100%" clip-path="url(#clip)">
    <div style="width:100%; height:100%"></div>
  </foreignObject>
  <circle id="dial" fill="url(#dialfill)"></circle>
`

class ZiiiroClock extends HTMLElement {
  content = document.createElementNS(SVG_NS, 'svg')
  hourHand: HTMLElement
  minuteHand: HTMLElement

  constructor() {
    super()

    this.content.innerHTML = template
    this.hourHand = this.content.querySelector('#hours')!
      .firstElementChild as HTMLElement
    this.minuteHand = this.content.querySelector('#minutes')!
      .firstElementChild as HTMLElement
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' })

    const size = this.clientHeight
    const halfSize = size / 2

    this.applyConicGradient(this.hourHand, 'hour')
    this.applyConicGradient(this.minuteHand, 'minute')

    this.applyAttributes('#clip circle', {
      r: halfSize,
      cx: halfSize,
      cy: halfSize,
    })

    this.applyAttributes('#dial', {
      r: size / 4,
      cx: halfSize,
      cy: halfSize,
    })

    this.content.setAttributeNS(null, 'viewBox', `0 0 ${size} ${size}`)

    this.shadowRoot?.append(style, this.content)

    this.render()
  }

  render() {
    this.renderTime(new Date())
    requestAnimationFrame(this.render.bind(this))
  }

  renderTime(time: Date) {
    const degrees = getClockAngles(time)

    this.minuteHand.style.transform = `rotate(${degrees.minute}deg)`
    this.hourHand.style.transform = `rotate(${degrees.hour}deg)`
  }

  applyConicGradient(el: HTMLElement, attrName: string) {
    Object.assign(el.style, {
      background: `conic-gradient(transparent, ${this.getAttribute(attrName)})`,
    })
  }

  applyAttributes(query: string, attrs: Record<string, string | number>) {
    const el = this.content.querySelector(query)

    if (!el) {
      console.warn(`Unable to find element using query selector "${query}"`)

      return
    }

    for (const attr in attrs) {
      el.setAttributeNS(null, attr, String(attrs[attr]))
    }
  }
}

const style = document.createElement('style')

style.textContent = /*css*/ `
  * {
    box-sizing: border-box;
  }

  :host {
    position: relative;
  }

  /* :host {
    backdrop-filter: blur(2px);
    clip-path: circle(50%);
    background: rgb(255 45 81 / 0.2);
  } */

  /* .hours-container,
  .minutehand-container,
  .minutes-container {
    width: 100%;
    height: 100%;
    animation-name: rotate;
    animation-duration: 1s;
    animation-timing-function: var(--ease);
  }

  .hours-container,
  .minutes-container {
    mix-blend-mode: multiply;
  }

  .hours-container {
    box-shadow: -1px -1px 5px 5px black;
  }

  .hours-container,
  .minutehand-container {
    position: fixed;
    top: 0;
    left: 0;
  }

  .dial {
    animation: dial 0.5s 0.1s both var(--easeBounce);
    background: radial-gradient(#0e0e0e, #212037);
    border-radius: 50%;
    box-shadow: 1px 1px 12px 4px rgb(0 0 0 / 0.2);
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    transform-origin: center;
    width: 100%;
    z-index: 1;
  }

  .hours,
  .minutes {
    width: 100%;
    height: 100%;
    mask-size: 100%;
    mask-position: 50%;
    mask-image: conic-gradient(rgb(0 0 0 / 0), rgb(0 0 0 / 1));
    border-radius: 50%;
    box-shadow: inset 0px 0px 50px rgb(101 101 101 / 30%);
  }

  .minutehand {
    width: 5px;
    height: 50%;
    margin-left: calc(50% - 4px);
    transform-origin: bottom;
    background-color: rgb(255 0 250 / 0.6);
    box-shadow: -3px 0 10px 8px rgb(0 0 0 / 0.01);
  }

  @keyframes rotate {
    from {
      transform: rotate(-180deg);
    }
  }

  @keyframes dial {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(0.5);
    }
  } */

`

function applyAttributes(
  el: SVGElement | null,
  attrs: Record<string, string | number>,
) {
  if (!el) {
    throw new Error(`Cannot apply attributes to a "null" element!`)
  }

  for (const attr in attrs) {
    el.setAttributeNS(null, attr, String(attrs[attr]))
  }

  return el
}

function createSVGCircle() {
  return document.createElementNS(SVG_NS, 'circle')
}

customElements.define('ziiiro-clock', ZiiiroClock)
