import { Rapier2D } from '@p228/physics2d'

let rapierInstance!: Rapier2D

export const getRapierInstance = (): Rapier2D => {
  if (rapierInstance === undefined) {
    throw new Error('Rapier instance not initialized')
  }
  return rapierInstance
}

export const setRapierInstance = (rapier: Rapier2D): void => {
  rapierInstance = rapier
}