import bg from '../assets/bg.png'

class ZiiiroClock extends HTMLElement {
  content = {
    face: createFace(this.offsetWidth),
    dial: createElementWithClassName('dial'),
    minutes: createContainer('minutes-container', 'minutes'),
    hours: createContainer('hours-container', 'hours'),
    minuteHand: createContainer('minutehand-container', 'minutehand'),
  }

  connectedCallback() {
    this.attachShadow({ mode: 'open' })

    this.shadowRoot?.append(style)
    this.applyColors().shadowRoot?.append(...Object.values(this.content))

    requestAnimationFrame(this.render.bind(this))

    let throttled = false
    const delay = 250

    globalThis.addEventListener('resize', () => {
      if (!throttled) {
        const faceStyle = this.content.face.attributeStyleMap

        this.content.face = createFace(this.offsetWidth)
        this.shadowRoot?.querySelector('.face')?.replaceWith(this.content.face)

        for (const [key, value] of faceStyle) {
          this.content.face.style.setProperty(key, String(value))
        }
      }

      throttled = true

      setTimeout(() => {
        throttled = false
      }, delay)
    })
  }

  render() {
    this.renderTime(new Date())
    requestAnimationFrame(this.render.bind(this))
  }

  applyColors() {
    const {
      minutes,
      minuteHand,
      hours,
      dial,
      face,
    } = this.content

    const applyStyle = (
      el: Element | null,
      key: string,
      attr: string,
    ) => {
      ;(el as HTMLElement | null)?.style.setProperty(
        key,
        this.getAttribute(attr),
      )
    }

    applyStyle(minutes.firstElementChild, 'background-color', 'minute')
    applyStyle(
      minuteHand.firstElementChild,
      'background-color',
      'minutehand',
    )
    applyStyle(hours.firstElementChild, 'background-color', 'hour')
    applyStyle(dial, 'background-color', 'dial')
    applyStyle(dial, 'border-color', 'dialborder')
    applyStyle(face, 'color', 'marker')

    return this
  }

  renderTime(time: Date) {
    const { minutes, minuteHand, hours } = this.content
    const degrees = this.getClockAngles(time)

    minutes.style.transform =
      minuteHand.style.transform =
        `rotate(${degrees.minute}deg)`
    hours.style.transform = `rotate(${degrees.hour}deg)`
  }

  getClockAngles(date: Date = new Date()) {
    const minutes = (date.getSeconds() / 60 + date.getMinutes()) / 60
    const hours = (date.getHours() + date.getMinutes() / 60) / 12

    return {
      minute: (minutes * 360) % 360,
      hour: (hours * 360) % 360,
    }
  }
}

const style = document.createElement('style')

style.textContent = /*css*/ `
  * {
    box-sizing: border-box;
  }

  .hours-container,
  .minutehand-container,
  .minutes-container {
    width: 100%;
    height: 100%;
    animation-name: rotate;
    animation-duration: 1s;
    animation-timing-function: var(--ease);
  }

  .hours-container, .minutehand-container {
    position: fixed;
    top: 0;
    left: 0;
  }

  .dial, .face, .marker {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform-origin: center;
  }

  .dial, .face {
    z-index: 1;
  }

  .marker {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1.5%;
    height: 1.5%;
    margin: -0.65%;
    border-radius: 50%;
    background-color: currentColor;
  }

  .dial {
    border-radius: 50%;
    border-width: 8px;
    border-style: solid;
    animation: dial 0.5s 0.1s both var(--easeBounce);
  }

  .face {
    opacity: 1;
    animation: appear 0.5s 0.6s backwards;
  }

  .hours, .minutes {
    width: 100%;
    height: 100%;
    mask-size: 100%;
    mask-position: 50%;
    mask-image: url("${bg}");
    border-radius: 50%;
    overflow: hidden;
  }

  .minutehand {
    width: 4px;
    height: 50%;
    margin-left: calc(50% - 2px);
    transform-origin: bottom;
    box-shadow: -1px 0 15px 0 rgba(0, 0, 0, 0.2);
  }

  @keyframes rotate {
    from {
      transform: rotate(-180deg);
    }
  }

  @keyframes appear {
    from {
      opacity: 0;
    }
  }

  @keyframes dial {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(0.5);
    }
  }

`

function createContainer(containerClassName?: string, childClassName?: string) {
  const container = createElementWithClassName(containerClassName)
  const child = createElementWithClassName(childClassName)

  container.append(child)

  return container
}

function createElementWithClassName(className?: string) {
  const el = document.createElement('div')

  if (className) el.className = className

  return el
}

function createFace(size: number) {
  const face = createElementWithClassName('face')
  const distance = size / 2 * 0.75

  for (let i = 0; i < 12; i += 1) {
    const marker = createElementWithClassName('marker')
    const angle = i * 360 / 12

    marker.style.setProperty(
      'transform',
      `rotate(${angle}deg) translate(${distance}px)`,
    )

    face.append(marker)
  }

  return face
}

export default customElements.define('ziiiro-clock', ZiiiroClock)
