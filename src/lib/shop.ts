export const SHOP = { name: 'Fillmore Street', address: '1910 Fillmore St, San Francisco, CA', hours: 'Every day · 7:00 AM–6:00 PM', timeZone: 'America/Los_Angeles' }
export function shopIsOpen(now = Date.now()) {
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: SHOP.timeZone, hour: 'numeric', hourCycle: 'h23' }).format(now))
  return hour >= 7 && hour < 18
}
export function pickupSlots(now = Date.now()) {
  const start = Math.ceil((now + 15 * 60_000) / (15 * 60_000)) * 15 * 60_000
  return Array.from({ length: 8 }, (_, index) => start + index * 15 * 60_000).filter((time) => shopIsOpen(time) && shopIsOpen(time - 6 * 60_000))
}
