import { useState } from 'react';

export default function GlowButton({ children, onClick, variant = 'primary', size = 'md', style = {}, type = 'button', disabled = false, href }) {
  const [hover, setHover] = useState(false);
  const [down, setDown] = useState(false);

  const sizes = {
    sm: { padding: '8px 22px', fontSize: 12 },
    md: { padding: '13px 32px', fontSize: 14 },
    lg: { padding: '16px 48px', fontSize: 15 },
    xl: { padding: '18px 60px', fontSize: 17 },
  };

  const base = {
    borderRadius: 30,
    border: 'none',
    fontWeight: 700,
    letterSpacing: '0.5px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    textDecoration: 'none',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
    ...sizes[size],
  };

  const v = {
    primary: {
      background: hover
        ? 'linear-gradient(135deg, #ff6bb5 0%, #e91e8c 50%, #c2166f 100%)'
        : 'linear-gradient(135deg, #e91e8c 0%, #c2166f 100%)',
      color: 'white',
      boxShadow: hover
        ? '0 8px 36px rgba(233,30,140,0.6), 0 0 60px rgba(233,30,140,0.2), inset 0 1px 0 rgba(255,255,255,0.25)'
        : '0 4px 20px rgba(233,30,140,0.4), inset 0 1px 0 rgba(255,255,255,0.18)',
      transform: down ? 'translateY(1px) scale(0.98)' : hover ? 'translateY(-3px) scale(1.02)' : 'translateY(0) scale(1)',
    },
    outline: {
      background: hover ? 'rgba(233,30,140,0.1)' : 'transparent',
      color: '#e91e8c',
      border: `2px solid ${hover ? '#e91e8c' : 'rgba(233,30,140,0.45)'}`,
      boxShadow: hover ? '0 0 24px rgba(233,30,140,0.3), inset 0 0 16px rgba(233,30,140,0.06)' : 'none',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
    },
    ghost: {
      background: 'transparent',
      color: hover ? '#e91e8c' : '#888',
      transform: 'none',
      boxShadow: 'none',
    },
    dark: {
      background: hover ? '#242424' : '#1a1a1a',
      color: '#f5f1e8',
      border: '1px solid rgba(255,255,255,0.09)',
      boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' : '0 4px 16px rgba(0,0,0,0.35)',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
    },
    telegram: {
      background: hover ? 'linear-gradient(135deg, #2aa9e0, #1c88ba)' : '#229ED9',
      color: 'white',
      boxShadow: hover ? '0 8px 36px rgba(34,158,217,0.55), 0 0 48px rgba(34,158,217,0.2)' : '0 4px 20px rgba(34,158,217,0.4)',
      transform: hover ? 'translateY(-3px) scale(1.02)' : 'translateY(0)',
    },
    whatsapp: {
      background: hover ? 'linear-gradient(135deg, #2fe07a, #1ea952)' : '#25d366',
      color: 'white',
      boxShadow: hover ? '0 8px 36px rgba(37,211,102,0.55), 0 0 48px rgba(37,211,102,0.2)' : '0 4px 20px rgba(37,211,102,0.4)',
      transform: hover ? 'translateY(-3px) scale(1.02)' : 'translateY(0)',
    },
  };

  const Tag = href ? 'a' : 'button';

  return (
    <Tag
      href={href}
      target={href ? '_blank' : undefined}
      rel={href ? 'noreferrer' : undefined}
      type={!href ? type : undefined}
      onClick={!disabled ? onClick : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setDown(false); }}
      onMouseDown={() => setDown(true)}
      onMouseUp={() => setDown(false)}
      disabled={disabled && !href}
      style={{ ...base, ...v[variant], ...style }}
    >
      {/* Shine sweep on hover */}
      <span style={{
        position: 'absolute', inset: 0, borderRadius: 'inherit',
        background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.18) 50%, transparent 65%)',
        transform: hover ? 'translateX(200%) skewX(-15deg)' : 'translateX(-200%) skewX(-15deg)',
        transition: 'transform 0.55s ease',
        pointerEvents: 'none',
      }} />
      {children}
    </Tag>
  );
}
