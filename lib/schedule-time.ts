// lib/schedule-time.ts

import { formatInTimeZone, fromZonedTime } from 'date-fns-tz'

export const BUSINESS_TIME_ZONE = 'America/Los_Angeles'

export function buildShiftDateTimes(date: string, startTime: string, endTime: string) {
  const startsAt = fromZonedTime(`${date}T${startTime}:00`, BUSINESS_TIME_ZONE)
  const endsAt = fromZonedTime(`${date}T${endTime}:00`, BUSINESS_TIME_ZONE)

  return {
    startsAt,
    endsAt,
  }
}

export function toDateFieldValue(iso: string) {
  return formatInTimeZone(iso, BUSINESS_TIME_ZONE, 'yyyy-MM-dd')
}

export function toTimeFieldValue(iso: string) {
  return formatInTimeZone(iso, BUSINESS_TIME_ZONE, 'HH:mm')
}