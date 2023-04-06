export const GameSceneAssets = {
  Warrior: '/game/heroes/Warrior.json',
  Sergeant: '/game/heroes/Sergeant.json',
  Paladin: '/game/heroes/Paladin.json',
  Misc: '/game/Misc.json',
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
