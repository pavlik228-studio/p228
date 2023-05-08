import { Assets } from 'pixi.js'
import FontFaceObserver from 'fontfaceobserver'
import React, { FC, Suspense, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { SplashScreen } from './components/splash-screen'
import { setRapierInstance } from './misc/rapier-store'
import { ResourcesManifest } from './resource-manifest'

const GameCanvasLazy = React.lazy(() => import('./game-canvas'))

export const GamePage: FC = () => {
  const location = useLocation()
  const [ rapierInitialized, setRapierInitialized ] = useState(false)
  const [ isLoaded, setIsLoaded ] = useState(false)

  useEffect(() => {
    const sofiaSansFontPromise = new FontFaceObserver('Sofia Sans').load()
    const russoOneFontPromise = new FontFaceObserver('Russo One').load()

    Assets.init({ manifest: ResourcesManifest }).catch(console.error)
    const gameSceneAssetsPromise = Assets.loadBundle('game-scene')

    Promise.all([
      sofiaSansFontPromise,
      russoOneFontPromise,
      gameSceneAssetsPromise,
      // loadWeaponsConfig(),
    ]).then(() => setIsLoaded(true))

    import('@dimforge/rapier2d').then((rapier) => {
      setRapierInstance(rapier)
      setRapierInitialized(true)
    })
  }, [])

  return (rapierInitialized && isLoaded) ? (
    <>
      <Suspense fallback={<SplashScreen />}>
        <GameCanvasLazy isShown={location.pathname === '/game'} />
      </Suspense>
    </>
  ) : <SplashScreen />
}