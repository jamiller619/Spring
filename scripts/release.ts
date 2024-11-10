import AdmZip from 'adm-zip'
import fs from 'node:fs/promises'
import manifest from '../packages/chrome/package.json' with { type: 'json' }

const zip = new AdmZip()

for await (const file of await fs.readdir('./dist/chrome')) {
  zip.addLocalFile(`./dist/chrome/${file}`)
}

try {
  await fs.mkdir('release')
} catch {}

zip.writeZip(`release/spring-v${manifest.version}.zip`)
