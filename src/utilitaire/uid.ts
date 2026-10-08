let uid = 0

export function nextUid(prefix = 't'): string {
  uid += 1
  return `${prefix}-${uid}`
}
