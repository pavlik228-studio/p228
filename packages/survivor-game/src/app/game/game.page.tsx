import { Assets } from 'pixi.js'
import React, { FC, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SplashScreen } from './components/splash-screen'
import { GameCanvas } from './game-canvas'
import { setRapierInstance } from './misc/rapier-store'
import { ResourcesManifest } from './resource-manifest'

export const GamePage: FC = () => {
  const location = useLocation()
  const [ rapierInitialized, setRapierInitialized ] = useState(false)
  const [ isLoaded, setIsLoaded ] = useState(false)

  useEffect(() => {
    Assets.init({ manifest: ResourcesManifest }).catch(console.error)
    Assets.loadBundle('game-scene', console.log).then(() => setIsLoaded(true))
    import('@dimforge/rapier2d').then((rapier) => {
      setRapierInstance(rapier)
      setRapierInitialized(true)
    })
  }, [])

  return (rapierInitialized && isLoaded) ? (
    <>
      <GameCanvas isShown={location.pathname === '/game'} />
      <Outlet />
    </>
  ) : <SplashScreen />
}