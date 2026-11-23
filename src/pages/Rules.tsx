import { RULES } from '../data/catalog'

export function Rules() {
  return (
    <div className="page wide-pad">
      <div className="section-head">
        <h2>规则</h2>
        <p>玩法速览</p>
      </div>
      <div className="rules-list">
        {Object.entries(RULES).map(([key, rule]) => (
          <details key={key} open={key === 'slot'}>
            <summary>{rule.title}</summary>
            <p>{rule.body}</p>
          </details>
        ))}
      </div>
      <p className="disclaimer">
        所有 RTP、赔率与开奖均为示意数值，用于产品原型演示，不构成博彩要约。
      </p>
    </div>
  )
}
