import { DataType, defineComponent, IFixedList } from '@p228/ecs'

const playerSchema = {
  slot: DataType.u8,
  character: DataType.u8,
  direction: DataType.f32,
  speed: DataType.f32,
  goldBalance: DataType.u32,
  shopState: DataType.f32,
  shopRerolls: DataType.u8,
  shopSlots: DataType.u8,
  shopBoughtSlots: [ DataType.u8, 6 ] as IFixedList,
  weaponCount: DataType.u8,
}
const playerStatsSchema = {
  hp: DataType.f32,
  armor: DataType.f32,
  dodge: DataType.f32,
  lifeSteal: DataType.f32,
  regeneration: DataType.f32,
  damage: DataType.f32,
  critChance: DataType.f32,
  critDamage: DataType.u16,
  movementSpeed: DataType.f32,
  attackSpeed: DataType.f32,
  range: DataType.u16,
  luck: DataType.f32,
  harvesting: DataType.f32,
}

export type PlayerSchema = typeof playerSchema
export type PlayerStatsSchema = typeof playerStatsSchema

export const Player = defineComponent({
  ...playerSchema,
  ...playerStatsSchema,
})