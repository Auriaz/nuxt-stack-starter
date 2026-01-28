type MotionState = Record<string, number | string | boolean | Record<string, number | string | boolean>>

export type MotionPreset = {
  initial: MotionState
  animate: MotionState
}

export const motionPresets = {
  sectionEnter: {
    initial: { opacity: 0, y: 28, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  },
  cardEnter: {
    initial: { opacity: 0, y: 12, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
  },
  alertAppear: {
    initial: { opacity: 0, y: 8, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }
  }
} satisfies Record<string, MotionPreset>

export function getMotionPreset(preset: MotionPreset, reduceMotion: boolean) {
  return reduceMotion
    ? {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 }
      }
    : preset
}
