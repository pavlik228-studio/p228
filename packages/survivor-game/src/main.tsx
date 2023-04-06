import * as ReactDOM from 'react-dom/client'

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

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
)
root.render(
  <App/>
)
