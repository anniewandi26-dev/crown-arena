import type { Card, Suit } from '../lib/rng'

const RANK_LABEL = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function SuitGlyph({ suit, className }: { suit: Suit; className?: string }) {
  const red = suit === 'H' || suit === 'D'
  const fill = red ? '#c41e3a' : '#121212'
  if (suit === 'H') {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden>
        <path
          fill={fill}
          d="M12 21s-7.2-4.6-9.6-8.2C.4 9.6 1.2 5.8 4.4 4.4 6.4 3.5 8.7 4 10 5.5L12 8l2-2.5C15.3 4 17.6 3.5 19.6 4.4c3.2 1.4 4 5.2 2 8.4C19.2 16.4 12 21 12 21z"
        />
      </svg>
    )
  }
  if (suit === 'D') {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden>
        <path fill={fill} d="M12 2l8 10-8 10L4 12 12 2z" />
      </svg>
    )
  }
  if (suit === 'C') {
    return (
      <svg className={className} viewBox="0 0 24 24" aria-hidden>
        <path
          fill={fill}
          d="M12 3a4.2 4.2 0 00-1.8 8 4.2 4.2 0 00-3.7 4.1A4.2 4.2 0 0011 19.2V21h2v-1.8a4.2 4.2 0 004.5-4.1 4.2 4.2 0 00-3.7-4.1A4.2 4.2 0 0012 3z"
        />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill={fill} d="M12 2c0 6-5 8-5 12a5 5 0 0010 0c0-4-5-6-5-12z" />
      <path fill={fill} d="M10 18h4v3h-4z" />
    </svg>
  )
}

function Pip({ suit }: { suit: Suit }) {
  return <SuitGlyph suit={suit} className="pc-pip" />
}

/** Classic pip layouts for 2–10 */
function PipField({ rank, suit }: { rank: number; suit: Suit }) {
  if (rank === 1) {
    return (
      <div className="pc-center ace">
        <SuitGlyph suit={suit} className="pc-ace" />
      </div>
    )
  }
  if (rank >= 11) {
    return <FaceArt rank={rank} suit={suit} />
  }

  const slots: Record<number, string[]> = {
    2: ['t', 'b'],
    3: ['t', 'm', 'b'],
    4: ['tl', 'tr', 'bl', 'br'],
    5: ['tl', 'tr', 'm', 'bl', 'br'],
    6: ['tl', 'tr', 'ml', 'mr', 'bl', 'br'],
    7: ['tl', 'tr', 'ml', 'mr', 'bl', 'br', 'tm'],
    8: ['tl', 'tr', 'ml', 'mr', 'bl', 'br', 'tm', 'bm'],
    9: ['tl', 'tr', 'tml', 'tmr', 'm', 'bml', 'bmr', 'bl', 'br'],
    10: ['tl', 'tr', 'tml', 'tmr', 'tm', 'bm', 'bml', 'bmr', 'bl', 'br'],
  }

  return (
    <div className={`pc-pips r${rank}`}>
      {(slots[rank] ?? []).map((pos) => (
        <span key={pos} className={`pc-slot ${pos}`}>
          <Pip suit={suit} />
        </span>
      ))}
    </div>
  )
}

function FaceArt({ rank, suit }: { rank: number; suit: Suit }) {
  const red = suit === 'H' || suit === 'D'
  const ink = red ? '#c41e3a' : '#1a1a1a'
  const label = RANK_LABEL[rank - 1]
  return (
    <div className="pc-face">
      <svg viewBox="0 0 70 110" className="pc-face-svg" aria-hidden>
        <rect x="6" y="8" width="58" height="94" rx="4" fill="#f4efe6" stroke={ink} strokeWidth="1.2" />
        <rect x="10" y="14" width="50" height="82" rx="2" fill="none" stroke={ink} strokeWidth="0.6" opacity="0.35" />
        {/* stylized court figure */}
        <circle cx="35" cy="40" r="12" fill="#f7f2ea" stroke={ink} strokeWidth="1.4" />
        <path d="M23 40h24" stroke={ink} strokeWidth="1.2" />
        <path
          d={
            rank === 11
              ? 'M20 78c4-14 10-18 15-18s11 4 15 18'
              : rank === 12
                ? 'M18 78c3-16 9-22 17-22s14 6 17 22'
                : 'M17 78c4-18 10-24 18-24s14 6 18 24'
          }
          fill="#e8dfd0"
          stroke={ink}
          strokeWidth="1.3"
        />
        {rank === 12 && (
          <path d="M24 28c3-8 8-12 11-12s8 4 11 12" fill="none" stroke={ink} strokeWidth="1.4" />
        )}
        {rank === 13 && (
          <path d="M22 26l13-10 13 10-4 6H26l-4-6z" fill="#d4b483" stroke={ink} strokeWidth="1" />
        )}
        <text
          x="35"
          y="96"
          textAnchor="middle"
          fontFamily="Georgia, serif"
          fontSize="14"
          fontWeight="700"
          fill={ink}
        >
          {label}
        </text>
      </svg>
      <div className="pc-face-suits">
        <SuitGlyph suit={suit} className="pc-pip" />
        <SuitGlyph suit={suit} className="pc-pip flip" />
      </div>
    </div>
  )
}

export function PlayingCard({
  card,
  hidden = false,
  small = false,
}: {
  card?: Card
  hidden?: boolean
  small?: boolean
}) {
  if (hidden || !card) {
    return (
      <div className={`pc${small ? ' small' : ''} back`} aria-label="牌背">
        <div className="pc-back-pattern" />
      </div>
    )
  }

  const red = card.suit === 'H' || card.suit === 'D'
  const label = RANK_LABEL[card.rank - 1]

  return (
    <div
      className={`pc${small ? ' small' : ''}${red ? ' red' : ' black'}`}
      aria-label={`${label}${card.suit}`}
    >
      <div className="pc-corner top">
        <span>{label}</span>
        <SuitGlyph suit={card.suit} className="pc-corner-suit" />
      </div>
      <PipField rank={card.rank} suit={card.suit} />
      <div className="pc-corner bottom">
        <span>{label}</span>
        <SuitGlyph suit={card.suit} className="pc-corner-suit" />
      </div>
    </div>
  )
}

export function rankLabel(rank: number) {
  return RANK_LABEL[rank - 1] ?? String(rank)
}
