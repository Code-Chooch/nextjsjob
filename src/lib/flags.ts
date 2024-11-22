import { unstable_flag as flag } from '@vercel/flags/next'

export const redirectAllPagesToComingSoon = flag({
  key: 'redirect-all-pages-to-coming-soon',
  decide: () => process.env.FLAG_REDIRECT_ALL_PAGES_TO_COMING_SOON === '1',
})
