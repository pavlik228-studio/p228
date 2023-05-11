import { MathOps } from '@p228/math'
import { ItemId, ItemsConfig } from './features/item/data/items-type'
import { PlayerStatsSchema } from './features/player/components/player'
import { IWeapon, WeaponAttackType, WeaponId, WeaponsConfig } from './features/weapon/data/weapon-type'
import { SheetsAPI } from './sheets-api'

const SHEET_ID = '1Z8de_G0DAc4LUCKznoLPA_JTyWRk-gzA9rt7WjibFwI'

export const SimulationData = {
  weapons: {
    [WeaponId.Sword]: {
      price: [ 100, 200, 300, 400 ],
      cooldown: [ 1.37, 1.28, 1.13, 0.98 ],
      baseDamage: [ 15, 25, 40, 60 ],
      critChance: [ 0.03, 0.03, 0.03, 0.03 ],
      critDamage: [ 2, 2, 2, 2 ],
      attackType: WeaponAttackType.Thrust,
      range: 260,
      width: 40,
      height: 10,
      duration: 12,
    } as IWeapon<WeaponAttackType.Thrust>,

    [WeaponId.EthernalGun]: {
      price: [ 200, 400, 800, 1200 ],
      cooldown: [ 1.2, 1.12, 0.93, 0.87 ],
      baseDamage: [ 12, 16, 21, 35 ],
      critChance: [ 0.03, 0.03, 0.03, 0.03 ],
      critDamage: [ 2, 2, 2, 2 ],
      attackType: WeaponAttackType.Projectile,
      range: 500,
      speed: 40,
    } as IWeapon<WeaponAttackType.Projectile>,

    [WeaponId.EthernalBlaster]: {
      price: [ 100, 200, 300, 400 ],
      cooldown: [ 1.37, 1.28, 1.20, 1.12 ],
      baseDamage: [ 12, 24, 36, 72 ],
      critChance: [ 0.03, 0.03, 0.03, 0.03 ],
      critDamage: [ 2, 2, 2, 2 ],
      attackType: WeaponAttackType.SpotProjectile,
      range: 500,
      speed: 40,
      angle: MathOps.Deg2Rad * 20,
      projectiles: 7,
    } as IWeapon<WeaponAttackType.SpotProjectile>,

    [WeaponId.EthernalRpg]: {
      price: [ 0, 200, 300, 400 ],
      cooldown: [ 0, 1.78, 1.37, 1.03 ],
      baseDamage: [ 0, 50, 80, 100 ],
      critChance: [ 0.03, 0.03, 0.03, 0.03 ],
      critDamage: [ 2, 2, 2, 2 ],
      attackType: WeaponAttackType.RocketProjectile,
      range: 700,
      duration: 50,
      explosionRadius: 300,
    } as IWeapon<WeaponAttackType.RocketProjectile>,

  } as WeaponsConfig,

  items: {
    [ItemId.MoneyBag]: { price: 100, level: 0, stats: [ [ 'harvesting', 0.3 ], ], },
    [ItemId.ChainReaction]: { price: 100, level: 0, stats: [], },
    [ItemId.GhoulElixir]: { price: 100, level: 0, stats: [ [ 'lifeSteal', 0.02 ], [ 'harvesting', -0.2 ] ], },
    [ItemId.Lamp]: { price: 100, level: 1, stats: [ [ 'range', 0.2 ], [ 'attackSpeed', 0.1 ], [ 'lifeSteal', -0.02 ] ], },
    [ItemId.Bracer]: { price: 100, level: 0, stats: [], },
    [ItemId.Bomb]: { price: 100, level: 0, stats: [] },
  } as ItemsConfig ,
}

export const loadWeaponsConfig = async () => {
  const weaponData = SimulationData.weapons = {} as WeaponsConfig
  const weaponsSheetApi = new SheetsAPI(SHEET_ID, 'WEAPONS')
  const weaponsRaw = await weaponsSheetApi.load<WeaponConfigItem>()
  // merge weapons
  for (const weapon of weaponsRaw) {
    if (!WeaponId.hasOwnProperty(weapon.Id)) throw new Error(`Unknown weapon type: ${weapon.Id}`)
    if (!WeaponAttackType.hasOwnProperty(weapon.DamageType)) throw new Error(`Unknown weapon attack type: ${weapon.DamageType}`)
    if (weapon.Level < 1 || weapon.Level > 4) throw new Error(`Unknown weapon level: ${weapon.Level}`)

    const weaponType = WeaponId[weapon.Id as keyof typeof WeaponId]
    const weaponAttackType = WeaponAttackType[weapon.DamageType as keyof typeof WeaponAttackType]
    const weaponLevel = weapon.Level as unknown as 1 | 2 | 3 | 4
    const levelIndex = weaponLevel - 1

    if (!weaponData[weaponType]) {
      weaponData[weaponType] = {
        price: [ 0, 0, 0, 0 ],
        cooldown: [ 0, 0, 0, 0 ],
        baseDamage: [ 0, 0, 0, 0 ],
        critChance: [ 0, 0, 0, 0 ],
        critDamage: [ 0, 0, 0, 0 ],
        attackType: weaponAttackType,
        range: weapon.Range,
        angle: weapon.SpotAngle * MathOps.Deg2Rad,
        projectiles: weapon.SpotProjectiles,
        speed: weapon.ProjectileSpeed,
        explosionRadius: weapon.ExplosionRadius,
        duration: weapon.DurationTicks,
        width: weapon.Width,
        height: weapon.Height,
      }
    }

    weaponData[weaponType]!.price[levelIndex] = weapon.Price || 0
    weaponData[weaponType]!.cooldown[levelIndex] = weapon.Cooldown || 0
    weaponData[weaponType]!.baseDamage[levelIndex] = weapon.Damage || 0
    weaponData[weaponType]!.critChance[levelIndex] = weapon.CriticalChance || 0
    weaponData[weaponType]!.critDamage[levelIndex] = weapon.CriticalMult || 0
  }

  console.log('Loaded weapons', JSON.stringify(weaponData, null, 2))
}

export const loadItemsConfig = async () => {
  const itemsData = SimulationData.items = {} as ItemsConfig
  const itemsSheetApi = new SheetsAPI(SHEET_ID, 'ITEMS')
  const itemsRaw = await itemsSheetApi.load<ItemConfigItem>()

  for (const item of itemsRaw) {
    if (!ItemId.hasOwnProperty(item.id)) throw new Error(`Unknown item type: ${item.id}`)
    if (item.level < 1 || item.level > 4) throw new Error(`Unknown item level: ${item.level}`)

    const itemId = ItemId[item.id as keyof typeof ItemId]
    const itemLevel = item.level as unknown as 1 | 2 | 3 | 4
    const levelIndex = itemLevel - 1
    const stats = item.stats?.split(';').map(s => s.trim()).filter(s => s.length > 0)
      .map((stat) => stat.split('='))
      .map(([ stat, value ]) => [ stat, parseFloat(value) ] as [ keyof PlayerStatsSchema, number ])
    || []

    itemsData[itemId] = {
      level: levelIndex,
      price: item.price,
      stats,
    }
  }

  console.log('loaded items', JSON.stringify(itemsData, null, 2))
}

export const loadSimulationData = async () => {
  await Promise.all([
    loadWeaponsConfig(),
    loadItemsConfig(),
  ])
}

interface WeaponConfigItem {
  Id: string
  DamageType: keyof WeaponAttackType
  Level: 1 | 2 | 3 | 4
  Price: number
  Damage: number
  CriticalMult: number
  CriticalChance: number
  Cooldown: number
  Range: number
  ProjectileSpeed: number
  SpotAngle: number
  SpotProjectiles: number
  ExplosionRadius: number
  DurationTicks: number
  Width: number
  Height: number
}

interface ItemConfigItem {
  id: keyof ItemId
  price: number
  level: number
  stats: string
}
