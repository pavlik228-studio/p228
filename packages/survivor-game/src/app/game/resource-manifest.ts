export const GameSceneAssets = {
  Warrior: '/game/heroes/Warrior.json',
  Sergeant: '/game/heroes/Sergeant.json',
  Paladin: '/game/heroes/Paladin.json',
  Misc: '/game/Misc.json',
  Weapons: '/game/weapons-items.json',

  grassWorld: '/game/worlds/grass.jpg',

  MeleeSkull: '/game/enemies/melee-skull.json',
  RamSkull: '/game/enemies/ram-skull.json',
  RangeSkull: '/game/enemies/range-skull.json',
  ShieldSkull: '/game/enemies/shield-skull.json',

  ExplosionFX: '/game/explosion.json',
}

export const ResourcesManifest = {
  bundles: [
    {
      name: 'game-scene',
      assets: {
        ...GameSceneAssets,
      },
    },
  ],
}
