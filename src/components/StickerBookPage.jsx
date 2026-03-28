// src/components/StickerBookPage.jsx
import { useRef, useState, useEffect } from 'react';
import { STICKERS } from '../data/stickers.js';

const MAX_PER_PAGE = 20;
const BACKGROUNDS = [
  'linear-gradient(135deg, #fff0f5, #fce7f3)',
  'linear-gradient(135deg, #f0fdf4, #dcfce7)',
  'linear-gradient(135deg, #eff6ff, #dbeafe)',
  'linear-gradient(135deg, #fefce8, #fef9c3)',
  'linear-gradient(135deg, #f5f3ff, #ede9fe)',
];

const stickerMap = Object.fromEntries(STICKERS.map(s => [s.id, s]));

export default function StickerBookPage({ pageIndex, placed, collection, onUpdate }) {
  const pageRef = useRef(null);
  const placedRef = useRef(placed);
  placedRef.current = placed;

  // drag state lives in refs (avoids stale closures in global listeners)
  const dragRef = useRef(null);
  const [ghostPos, setGhostPos] = useState(null);

  const [selected, setSelected] = useState(null);
  const longPressTimer = useRef(null);

  // pinch/rotate state
  const pinchRef = useRef(null);

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // ─── Global pointer listeners (mounted once) ─────────────────────────────
  useEffect(() => {
    function onMove(e) {
      if (!dragRef.current) return;
      e.preventDefault();
      dragRef.current.currentX = e.clientX;
      dragRef.current.currentY = e.clientY;
      setGhostPos({ x: e.clientX, y: e.clientY });
    }

    function onUp(e) {
      clearTimeout(longPressTimer.current);
      const d = dragRef.current;
      if (!d) return;

      const rect = pageRef.current?.getBoundingClientRect();
      const inCanvas = rect &&
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top  && e.clientY <= rect.bottom;

      if (inCanvas && rect) {
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top)  / rect.height));
        const cur = placedRef.current;
        if (d.fromTray) {
          if (cur.length < MAX_PER_PAGE) {
            onUpdateRef.current([...cur, { stickerId: d.stickerId, x, y, scale: 1.0, rotation: 0 }]);
          }
        } else {
          onUpdateRef.current(cur.map((item, i) =>
            i === d.placedIndex ? { ...item, x, y } : item
          ));
        }
      }

      dragRef.current = null;
      setGhostPos(null);
      if (!d.fromTray) {
        // keep selected after drop so user can adjust
      } else {
        setSelected(null);
      }
    }

    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // ─── Drag start: tray ────────────────────────────────────────────────────
  function handleTrayPointerDown(e, stickerId) {
    e.preventDefault();
    clearTimeout(longPressTimer.current);
    dragRef.current = { stickerId, fromTray: true, placedIndex: -1, currentX: e.clientX, currentY: e.clientY };
    setGhostPos({ x: e.clientX, y: e.clientY });
    setSelected(null);
  }

  // ─── Drag start: placed sticker ──────────────────────────────────────────
  function handlePlacedPointerDown(e, placedIndex) {
    e.preventDefault();
    e.stopPropagation();

    // long-press → delete
    longPressTimer.current = setTimeout(() => {
      dragRef.current = null;
      setGhostPos(null);
      onUpdateRef.current(placedRef.current.filter((_, i) => i !== placedIndex));
      setSelected(null);
    }, 600);

    dragRef.current = {
      stickerId: placed[placedIndex].stickerId,
      fromTray: false,
      placedIndex,
      currentX: e.clientX,
      currentY: e.clientY,
    };
    setGhostPos({ x: e.clientX, y: e.clientY });
    setSelected(placedIndex);
  }

  // ─── Two-finger pinch (scale) + rotate ───────────────────────────────────
  function getTwoFingerInfo(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return {
      dist: Math.hypot(dx, dy),
      angle: Math.atan2(dy, dx),
    };
  }

  function handleCanvasTouchStart(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      // find which placed sticker is under the first touch
      const rect = pageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const tx = e.touches[0].clientX;
      const ty = e.touches[0].clientY;
      let hitIndex = -1;
      for (let i = placedRef.current.length - 1; i >= 0; i--) {
        const item = placedRef.current[i];
        const size = 64 * (item.scale ?? 1);
        const cx = rect.left + item.x * rect.width;
        const cy = rect.top  + item.y * rect.height;
        if (
          tx >= cx - size / 2 && tx <= cx + size / 2 &&
          ty >= cy - size / 2 && ty <= cy + size / 2
        ) {
          hitIndex = i;
          break;
        }
      }
      const info = getTwoFingerInfo(e.touches);
      pinchRef.current = {
        placedIndex: hitIndex,
        startDist: info.dist,
        startAngle: info.angle,
        startScale: hitIndex >= 0 ? (placedRef.current[hitIndex]?.scale ?? 1) : 1,
        startRotation: hitIndex >= 0 ? (placedRef.current[hitIndex]?.rotation ?? 0) : 0,
      };
      if (hitIndex >= 0) setSelected(hitIndex);
    }
  }

  function handleCanvasTouchMove(e) {
    if (e.touches.length !== 2 || !pinchRef.current || pinchRef.current.placedIndex < 0) return;
    e.preventDefault();
    const info = getTwoFingerInfo(e.touches);
    const scaleFactor = info.dist / pinchRef.current.startDist;
    const newScale = Math.max(0.3, Math.min(3.0, pinchRef.current.startScale * scaleFactor));
    const angleDelta = info.angle - pinchRef.current.startAngle;
    const newRotation = pinchRef.current.startRotation + (angleDelta * 180 / Math.PI);
    const idx = pinchRef.current.placedIndex;
    onUpdateRef.current(placedRef.current.map((item, i) =>
      i === idx ? { ...item, scale: newScale, rotation: newRotation } : item
    ));
  }

  function handleCanvasTouchEnd() {
    pinchRef.current = null;
  }

  // ─── Control bar handlers ─────────────────────────────────────────────────
  function handleScaleChange(val) {
    if (selected === null) return;
    onUpdateRef.current(placed.map((item, i) => i === selected ? { ...item, scale: val } : item));
  }

  function handleRotate(delta) {
    if (selected === null) return;
    onUpdateRef.current(placed.map((item, i) =>
      i === selected ? { ...item, rotation: ((item.rotation ?? 0) + delta + 360) % 360 } : item
    ));
  }

  function handleDeleteSelected() {
    if (selected === null) return;
    onUpdateRef.current(placed.filter((_, i) => i !== selected));
    setSelected(null);
  }

  const selectedItem = selected !== null ? placed[selected] : null;
  const ghostSticker = ghostPos && dragRef.current ? stickerMap[dragRef.current.stickerId] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* 選択中コントロールバー */}
      {selectedItem && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', background: 'white',
          borderBottom: '2px solid #fbcfe8', flexShrink: 0,
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 800, whiteSpace: 'nowrap' }}>🔍</span>
          <input
            type="range" min={0.3} max={3.0} step={0.05}
            value={selectedItem.scale ?? 1.0}
            onChange={e => handleScaleChange(parseFloat(e.target.value))}
            style={{ flex: 1, minWidth: 60, accentColor: '#ec4899' }}
          />
          <button onClick={() => handleRotate(-15)} style={btnStyle}>↺</button>
          <button onClick={() => handleRotate(15)} style={btnStyle}>↻</button>
          <button onClick={handleDeleteSelected} style={{ ...btnStyle, background: '#fce7f3', color: '#9d174d' }}>🗑️</button>
          <button onClick={() => setSelected(null)} style={{ ...btnStyle, background: '#f3f4f6', color: '#6b7280' }}>✕</button>
        </div>
      )}

      {/* キャンバス */}
      <div
        ref={pageRef}
        style={{
          flex: 1,
          position: 'relative',
          background: BACKGROUNDS[pageIndex % BACKGROUNDS.length],
          borderRadius: 16,
          overflow: 'hidden',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onTouchStart={handleCanvasTouchStart}
        onTouchMove={handleCanvasTouchMove}
        onTouchEnd={handleCanvasTouchEnd}
      >
        {placed.map((item, i) => {
          const sticker = stickerMap[item.stickerId];
          if (!sticker) return null;
          const size = 64 * (item.scale ?? 1);
          const rotation = item.rotation ?? 0;
          const isSel = selected === i;
          return (
            <div
              key={`${item.stickerId}-${i}`}
              style={{
                position: 'absolute',
                left: `calc(${item.x * 100}% - ${size / 2}px)`,
                top:  `calc(${item.y * 100}% - ${size / 2}px)`,
                width: size, height: size,
                cursor: 'grab',
                borderRadius: 12,
                zIndex: isSel ? 10 : 1,
                transform: `rotate(${rotation}deg)`,
                filter: isSel
                  ? 'drop-shadow(0 0 8px #ec4899) drop-shadow(0 0 16px rgba(236,72,153,0.5))'
                  : 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))',
              }}
              onPointerDown={e => handlePlacedPointerDown(e, i)}
            >
              <img
                src={sticker.imagePath} alt={sticker.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                draggable={false}
              />
            </div>
          );
        })}

        {placed.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            color: '#d1d5db', fontWeight: 'bold', pointerEvents: 'none',
          }}>
            <div style={{ fontSize: '2.5rem' }}>🩷</div>
            <div style={{ fontSize: '0.9rem' }}>下のシールをドラッグしてはろう！</div>
          </div>
        )}
      </div>

      {/* ドラッグ中ゴースト（viewport固定） */}
      {ghostSticker && ghostPos && (
        <div style={{
          position: 'fixed',
          left: ghostPos.x - 40,
          top:  ghostPos.y - 40,
          width: 80, height: 80,
          pointerEvents: 'none',
          opacity: 0.82,
          zIndex: 9999,
          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.4))',
        }}>
          <img
            src={ghostSticker.imagePath} alt={ghostSticker.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            draggable={false}
          />
        </div>
      )}

      {/* シールトレイ */}
      <div style={{
        height: 96, overflowX: 'auto',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 14px',
        background: 'white',
        borderTop: '2px solid #fbcfe8',
        touchAction: 'pan-x',
        flexShrink: 0,
      }}>
        {collection.length === 0 ? (
          <div style={{ color: '#9ca3af', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            ガチャでシールを集めよう！
          </div>
        ) : (
          collection.map((id, idx) => {
            const sticker = stickerMap[id];
            if (!sticker) return null;
            return (
              <div
                key={`${id}-${idx}`}
                style={{
                  flexShrink: 0, width: 68, height: 68,
                  cursor: 'grab',
                  touchAction: 'none',
                  borderRadius: 12,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                }}
                onPointerDown={e => handleTrayPointerDown(e, id)}
              >
                <img
                  src={sticker.imagePath} alt={sticker.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  draggable={false}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const btnStyle = {
  border: 'none', background: '#fce7f3', color: '#9d174d',
  borderRadius: 8, padding: '4px 10px', fontSize: '0.85rem',
  fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap',
};
