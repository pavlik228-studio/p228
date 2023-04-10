const prefix = 'animate__'
export const animateCSS = (element: HTMLElement, animation: string, fast = false) =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`
    const animationSpeed = `${prefix}${fast ? 'fast' : 'normal'}`

    element.classList.add(`${prefix}animated`, animationName, animationSpeed)

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event: Event) {
      event.stopPropagation()
      element.classList.remove(`${prefix}animated`, animationName, animationSpeed)
      resolve('Animation ended')
    }

    element.addEventListener('animationend', handleAnimationEnd, {once: true})
  })