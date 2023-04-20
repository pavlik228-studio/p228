import { Route, Link, createBrowserRouter, Outlet, createRoutesFromElements, RouterProvider } from 'react-router-dom'
import classes from './app.module.sass'
import { GamePage } from './game/game.page'
import { GameRouteGuard } from './game/misc/game-route-guard'
import { StartScreen } from './game/ui/desktop/start-screen/start-screen'
import { DesktopTitleScreen } from './game/ui/desktop/title-screen/title-screen'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Outlet/>}>
      <Route path="/" element={<GamePage/>}>
        <Route index element={<DesktopTitleScreen/>}/>
        <Route path="start" element={<StartScreen/>}/>
        <Route path="game" element={<GameRouteGuard />}/>
      </Route>
      <Route
        path="/page-2"
        element={
          <div>
            <Link to="/">Click here to go back to root page.</Link>
          </div>
        }
      />
    </Route>,
  ),
)

export function App() {
  return (
    <div className={classes['root']}>
      <div className={classes['background']}/>
      <div className={classes['content']}>
        <RouterProvider router={router} />
      </div>
    </div>
  )
}

export default App

