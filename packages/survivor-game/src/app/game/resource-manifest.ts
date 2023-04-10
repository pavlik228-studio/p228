export const GameSceneAssets = {
  Warrior: '/game/heroes/Warrior.json',
  Sergeant: '/game/heroes/Sergeant.json',
  Paladin: '/game/heroes/Paladin.json',
  Misc: '/game/Misc.json',

  MeleeSkull: '/game/enemies/melee-skull.json',
  RamSkull: '/game/enemies/ram-skull.json',
  RangeSkull: '/game/enemies/range-skull.json',
  ShieldSkull: '/game/enemies/shield-skull.json',
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
