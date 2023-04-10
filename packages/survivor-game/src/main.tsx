import 'animate.css'
import * as ReactDOM from 'react-dom/client'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'


i18n
  .use(initReactI18next)
  .init({
    debug: true,
    resources: i18nResources,
    lng: import.meta.env.VITE_I18N_LOCALE,
    interpolation: {
      escapeValue: false,
    }
  }).catch(console.error)

//check webp support
const webpSupport = () => {
  const elem = document.createElement('canvas')
  if (!!(elem.getContext && elem.getContext('2d'))) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0
  } else {
    return false
  }
}

if (webpSupport()) {
  document.documentElement.classList.add('webp-supported')
}

import App from './app/app'
import { i18nResources } from './i18n-resources'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
)
root.render(
  <App/>
)
