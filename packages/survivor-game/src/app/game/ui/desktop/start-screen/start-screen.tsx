import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChooseHero } from '../components/choose-hero/choose-hero'
import { Items } from '../components/items/items'
import { unstable_useBlocker as useBlocker, useNavigate } from 'react-router-dom'

export const StartScreen: FC = () => {
  const { t } = useTranslation()
  const [ stage, setStage ] = useState<'hero' | 'items' | 'world'>('hero')
  const navigate = useNavigate()
  useBlocker(() => !window.confirm(t('backPrompt') as string))

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