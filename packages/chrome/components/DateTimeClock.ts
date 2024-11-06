class DateTimeClock extends HTMLElement {
  start = new Date()
  locale = this.hasAttribute('locale')
    ? this.getAttribute('locale') as string
    : globalThis.navigator.language || 'en-US'
  minutesLast = 0
  time = document.createElement('span')
  date = document.createElement('span')

  connectedCallback() {
    this.attachShadow({ mode: 'open' })

    this.time.className = 'time'
    this.date.className = 'date'

    this.shadowRoot?.append(style, this.time, this.date)

    globalThis.requestAnimationFrame(this.render.bind(this))
  }

  render() {
    const d = new Date()
    const minutes = d.getMinutes()

    if (this.minutesLast !== minutes) {
      this.renderDateTime(d)
      this.minutesLast = minutes
    }

    globalThis.requestAnimationFrame(this.render.bind(this))
  }

  renderDateTime(date: Date) {
    this.date.textContent = date.toLocaleString(this.locale, dateFormat)
    this.time.textContent = date.toLocaleString(this.locale, timeFormat)
  }
}

const dateFormat: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}

const timeFormat: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
}

const style = document.createElement('style')

style.textContent = /*css*/ `
  .date, .time {
    display: block;
    line-height: 1;
    opacity: 0;
    animation: appear forwards 200ms 300ms ease-out;
  }

  .date {
    font-size: 0.3em;
  }

  .time {
    font-size: 1em;
  }

  @keyframes appear {
    to {
      opacity: 1;
    }
  }
`

export default customElements.define('datetime-clock', DateTimeClock)
