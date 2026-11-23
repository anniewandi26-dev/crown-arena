import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: '主页', ico: '⌂' },
  { to: '/slots', label: '老虎机', ico: '◈' },
  { to: '/sports', label: '体育', ico: '◆' },
  { to: '/wallet', label: '钱包', ico: '▣' },
  { to: '/profile', label: '我的', ico: '◎' },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="主导航">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          <span className="ico">{item.ico}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
