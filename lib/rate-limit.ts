
import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { redis } from '@/lib/redis'

export const applicationRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'),
  prefix: 'personns:job-applications',
  analytics: false,
})
