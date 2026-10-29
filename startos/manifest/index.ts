import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'prowlarr',
  title: 'Prowlarr',
  license: 'GPL-3.0',
  packageRepo: 'https://github.com/Start9Labs/prowlarr-startos',
  upstreamRepo: 'https://github.com/Prowlarr/Prowlarr',
  marketingUrl: 'https://prowlarr.com/',
  donationUrl: 'https://prowlarr.com/donate',
  description: { short, long },
  volumes: ['main'],
  images: {
    prowlarr: {
      source: { dockerTag: 'lscr.io/linuxserver/prowlarr:2.7.0.5723-ls166' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
