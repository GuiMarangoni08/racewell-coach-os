// Selection and publication attempts are per browser tab and scoped to the authenticated user.
const memory = new Map<string, string>()
let activeOrganizationId: string | null = null
function read(key: string): string | null {
  try { return (typeof window === 'undefined' ? null : window.sessionStorage.getItem(key)) ?? memory.get(key) ?? null } catch { return memory.get(key) ?? null }
}
function write(key: string, value: string): void {
  memory.set(key, value)
  try { if (typeof window !== 'undefined') window.sessionStorage.setItem(key, value) } catch { /* memory fallback */ }
}
export const organizationStorage = {
  getForUser(userId: string): string | null { return read(`racewell.coach.organization:${userId}`) },
  select(userId: string, organizationId: string): void {
    write(`racewell.coach.organization:${userId}`, organizationId)
    activeOrganizationId = organizationId
  },
  getActive(): string | null { return activeOrganizationId },
  clearActive(): void { activeOrganizationId = null },
}
export function publicationKeyFor(userId: string, organizationId: string, weekId: string, rowVersion: number): string {
  const key = `racewell.coach.publish:${userId}:${organizationId}:${weekId}:${rowVersion}`
  const existing = read(key)
  if (existing) return existing
  const created = `publish-${crypto.randomUUID()}`
  write(key, created)
  return created
}
