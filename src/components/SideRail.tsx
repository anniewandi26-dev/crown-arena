import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: '主页', hint: '今晚厅堂' },
  { to: '/slots', label: '老虎机', hint: '搜索与厂牌' },
  { to: '/live', label: '直播桌', hint: '真人示意' },
  { to: '/sports', label: '体育', hint: '滚球注单' },
  { to: '/wallet', label: '钱包', hint: '试玩金' },
  { to: '/profile', label: '会员', hint: '榜单与活动' },
  { to: '/rules', label: '规则', hint: '玩法说明' },
]

export function SideRail() {
  return (
    <aside className="side-rail">
      <div className="brand-block brand-mark">
        <div className="logo">钥</div>
        <div className="name">
          金钥会
          <small>AUREUM</small>
        </div>
      </div>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          {item.label}
          <span>{item.hint}</span>
        </NavLink>
      ))}
      <p className="muted" style={{ marginTop: 'auto', fontSize: '0.75rem', lineHeight: 1.5 }}>
        试玩金原型 · 不含真实货币下注
      </p>
    </aside>
  )
}
