export function hexToRgba(hex: string, alpha: number): string | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const value = parseInt(match[1], 16)
  const r = (value >> 16) & 255
  const g = (value >> 8) & 255
  const b = value & 255
  const safeAlpha = Math.min(1, Math.max(0, alpha))
  return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`
}
