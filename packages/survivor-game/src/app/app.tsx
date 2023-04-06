import { Route, Routes, Link } from 'react-router-dom'
import classes from './app.module.sass'
import { GamePage } from './game/game.page'

export function App() {
  return (
    <div className={classes['root']}>
      <div className={classes['background']} />
      <div className={classes['content']}>
        <Routes>
          <Route
            path="/"
            element={<GamePage />}
          />
          <Route
            path="/page-2"
            element={
              <div>
                <Link to="/">Click here to go back to root page.</Link>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  )
}

export default App
