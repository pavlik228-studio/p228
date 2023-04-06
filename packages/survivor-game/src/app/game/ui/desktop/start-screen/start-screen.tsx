import React, { FC, useState } from 'react'
import { ChooseHero } from '../components/choose-hero/choose-hero'
import { Items } from '../components/items/items'
import { unstable_useBlocker as useBlocker, useNavigate } from 'react-router-dom'

export const StartScreen: FC = () => {
  const [ stage, setStage ] = useState<'hero' | 'items' | 'world'>('hero')
  const navigate = useNavigate()
  useBlocker(() => !window.confirm('Are you sure you want to leave the game?'))

  const onNext = () => {
    if (stage === 'hero') {
      setStage('items')
    } else if (stage === 'items') {
      setStage('world')
    }
  }

  const onBack = () => {
    if (stage === 'items') {
      setStage('hero')
    } else if (stage === 'world') {
      setStage('items')
    } else {
      navigate('/')
    }
  }

  return stage === 'hero'
    ? <ChooseHero onNext={onNext} onBack={onBack} />
    : stage === 'items'
      ? <Items onNext={onNext} onBack={onBack} />
      : null
}