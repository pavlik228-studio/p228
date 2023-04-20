import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { startGame } from '../../../../store/features/game/game-slice'
import { useAppDispatch } from '../../../../store/hooks'
import { ChooseHero } from '../components/choose-hero/choose-hero'
import { Items } from '../components/items/items'
import { unstable_usePrompt as usePrompt, useNavigate } from 'react-router-dom'

export const StartScreen: FC = () => {
  const {t} = useTranslation()
  const [ isBlocking, setIsBlocking ] = useState(true)
  const dispatch = useAppDispatch()
  const [ stage, setStage ] = useState<'hero' | 'items' | 'world'>('hero')
  const navigate = useNavigate()
  usePrompt({when: isBlocking, message: t('backPrompt')})

  const onNext = () => {
    if (stage === 'hero') {
      setStage('items')
    } else if (stage === 'items') {
      setIsBlocking(false)
      Promise.resolve().then(() => {
        dispatch(startGame())
        navigate('/game')
      })
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
    ? <ChooseHero onNext={onNext} onBack={onBack}/>
    : stage === 'items'
      ? <Items onNext={onNext} onBack={onBack}/>
      : null
}