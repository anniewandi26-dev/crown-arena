import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ClubProvider } from './store/useClub'
import { TopBar } from './components/TopBar'
import { BottomNav } from './components/BottomNav'
import { SideRail } from './components/SideRail'
import { Home } from './pages/Home'
import { Live } from './pages/Live'
import { Sports } from './pages/Sports'
import { Wallet } from './pages/Wallet'
import { Profile } from './pages/Profile'
import { Rules } from './pages/Rules'
import { GameRoom } from './pages/GameRoom'
import { Slots } from './pages/Slots'

export default function App() {
  return (
    <ClubProvider>
      <BrowserRouter>
        <div className="app-shell">
          <SideRail />
          <div className="main-col">
            <TopBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/slots" element={<Slots />} />
              <Route path="/live" element={<Live />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/play/:id" element={<GameRoom />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <BottomNav />
          </div>
        </div>
      </BrowserRouter>
    </ClubProvider>
  )
}
