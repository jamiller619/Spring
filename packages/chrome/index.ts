/// <reference lib="DOM" />
import bind from '@/options/bind'

import '@/components/EpicUnsplash.ts'
import '@/components/TimeClock.ts'
import '@/components/ZiiiroClock.ts'
import './components/favicon.ts'

bind('clock.hours.color', (color) => {
  document.querySelector('ziiiro-clock')?.setAttribute('hour', color)
})

bind('clock.minutes.color', (color) => {
  document.querySelector('ziiiro-clock')?.setAttribute('minute', color)
})

bind('unsplash.photo.type', (type) => {
  document.querySelector('epic-unsplash')?.setAttribute('key', type)
})

bind('unsplash.photo.value', (value) => {
  document.querySelector('epic-unsplash')?.setAttribute('value', value)
})
