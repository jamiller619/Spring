# Spring
> A minimal new tab page for Google Chrome

![Chrome Web Store](https://img.shields.io/chrome-web-store/v/lcomlokgcbklomfecjjpjlncapnhepbl.svg)
![Chrome Web Store](https://img.shields.io/chrome-web-store/users/lcomlokgcbklomfecjjpjlncapnhepbl.svg)
![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/lcomlokgcbklomfecjjpjlncapnhepbl.svg)
![license](https://img.shields.io/github/license/jamiller619/spring.svg)

# 🤖 Built with Web Components
- `<epic-unsplash />` Epic, full-page background photos from [Unsplash](http://www.unsplash.com).
- `<date-time />` A locale-aware date and time display.
- `<ziiiro-clock />` Make time for fun. [Inspired by Ziiiro.](http://www.ziiiro.com/)

# 💾 Install
From the [Google Chrome Web
Store.](https://chrome.google.com/webstore/detail/spring/lcomlokgcbklomfecjjpjlncapnhepbl?hl=en-US)

# 🗒️ Dev Notes
### Monorepo
This monorepo consists two very small packages:
- `chrome`: The Google Chrome extension
- `api`: A simple API for getting photos from Unsplash

### Unsplash
Unfortunately, Unsplash retired `source.unsplash.com` which
this extension used exclusively. Unsplash now requires using
their API which itself dictates we keep hidden all API keys.
So, yes, a monorepo which includes an API is hilarious
overkill for a god damn new tab browser extension.

### Deno
This entire project would have been in Deno, but to keep the
Chrome extension in TypeScript, a build step was necessary.
The current best options were Vite and Esbuild, neither of
which worked, without issue, in Deno. Vite works in Node.js, so
here we are. As a result, this monorepo requires both Node.js and Deno.
