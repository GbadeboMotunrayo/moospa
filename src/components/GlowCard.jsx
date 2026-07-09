import { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

export default function GlowCard({ children, style = {}, onClick, intensity = 1 }) {
  const { theme } = useApp();
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, active: false });

  const onMove = e => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTilt({
      rx: ((e.clientY - cy) / (rect.height / 2)) * -7 * intensity,
      ry: ((e.clientX - cx) / (rect.width / 2)) * 7 * intensity,
      active: true,
    });
  };

  const onLeave = () => setTilt({ rx: 0, ry: 0, active: false });

  const isDark = theme === 'dark';

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="shimmer-wrap"
      style={{
        background: isDark
          ? 'linear-gradient(145deg, #1f1320, #171017)'
          : 'linear-gradient(145deg, #ffffff, #fef0f8)',
        borderRadius: 22,
        border: tilt.active
          ? '1px solid rgba(233,30,140,0.45)'
          : `1px solid ${isDark ? 'rgba(233,30,140,0.1)' : 'rgba(233,30,140,0.15)'}`,
        boxShadow: tilt.active
          ? isDark
            ? '0 24px 64px rgba(0,0,0,0.7), 0 0 32px rgba(233,30,140,0.35), 0 0 64px rgba(233,30,140,0.12), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 24px 64px rgba(233,30,140,0.22), 0 8px 32px rgba(233,30,140,0.12), inset 0 1px 0 rgba(255,255,255,0.8)'
          : isDark
            ? '0 4px 24px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.04) inset'
            : '0 4px 24px rgba(233,30,140,0.07), 0 2px 8px rgba(0,0,0,0.05)',
        transform: tilt.active
          ? `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(14px)`
          : 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)',
        transition: tilt.active
          ? 'box-shadow 0.12s ease, border-color 0.15s ease'
          : 'transform 0.55s cubic-bezier(0.23,1,0.32,1), box-shadow 0.55s ease, border-color 0.55s ease',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        ...style,
      }}
    >
      {/* Top highlight stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: isDark
          ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
        pointerEvents: 'none', zIndex: 2,
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
