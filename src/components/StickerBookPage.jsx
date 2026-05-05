import { useRef, useState, useEffect } from 'react';
import { STICKERS } from '../data/stickers.js';

const MAX_PER_PAGE = 40;

const PAGE_COLORS = [
  { border: '#f9a8d4', bg: '#fdf2f8', dot: '#fce7f3' }, // ピンク
  { border: '#86efac', bg: '#f0fdf4', dot: '#dcfce7' }, // グリーン
  { border: '#93c5fd', bg: '#eff6ff', dot: '#dbeafe' }, // ブルー
  { border: '#fcd34d', bg: '#fefce8', dot: '#fef9c3' }, // イエロー
  { border: '#c4b5fd', bg: '#f5f3ff', dot: '#ede9fe' }, // パープル
  { border: '#fdba74', bg: '#fff7ed', dot: '#ffedd5' }, // オレンジ
  { border: '#fca5a5', bg: '#fff5f5', dot: '#fee2e2' }, // レッド
  { border: '#6ee7b7', bg: '#ecfdf5', dot: '#d1fae5' }, // ミント
  { border: '#7dd3fc', bg: '#f0f9ff', dot: '#e0f2fe' }, // スカイ
  { border: '#d8b4fe', bg: '#faf5ff', dot: '#f3e8ff' }, // ラベンダー
];

const DECOS = [
  { id: 'star',      emoji: '⭐' },
  { id: 'heart',     emoji: '❤️' },
  { id: 'sparkle',   emoji: '✨' },
  { id: 'sakura',    emoji: '🌸' },
  { id: 'ribbon',    emoji: '🎀' },
  { id: 'butterfly', emoji: '🦋' },
  { id: 'rainbow',   emoji: '🌈' },
  { id: 'clover',    emoji: '🍀' },
  { id: 'music',     emoji: '🎵' },
  { id: 'glitter',   emoji: '🌟' },
  { id: 'diamond',   emoji: '💎' },
  { id: 'flower',    emoji: '🌺' },
];

const decoMap = Object.fromEntries(DECOS.map(d => [d.id, d]));
const stickerMap = Object.fromEntries(STICKERS.map(s => [s.id, s]));

export default function StickerBookPage({ pageIndex, placed, collection, colorIndex, decos, onUpdate, onUpdateColor, onUpdateDecos }) {
  const pageRef = useRef(null);
  const placedRef = useRef(placed);
  placedRef.current = placed;
  const decosRef = useRef(decos);
  decosRef.current = decos;
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const onUpdateDecosRef = useRef(onUpdateDecos);
  onUpdateDecosRef.current = onUpdateDecos;

  const [pickedStickerId, setPickedStickerId] = useState(null);
  const [pickedDecoId, setPickedDecoId] = useState(null);
  const [selected, setSelected] = useState(null); // { type: 'sticker'|'deco', index: N }
  const [trayTab, setTrayTab] = useState('stickers');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const dragRef = useRef(null);
  const [ghostPos, setGhostPos] = useState(null);
  const longPressTimer = useRef(null);
  const pinchRef = useRef(null);

  // ─── Global pointer listeners ────────────────────────────────────────────
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
        if (d.type === 'sticker') {
          onUpdateRef.current(placedRef.current.map((item, i) =>
            i === d.index ? { ...item, x, y } : item
          ));
        } else {
          onUpdateDecosRef.current(decosRef.current.map((item, i) =>
            i === d.index ? { ...item, x, y } : item
          ));
        }
      }
      dragRef.current = null;
      setGhostPos(null);
    }
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  // ─── Tray taps ───────────────────────────────────────────────────────────
  function handleTrayTap(stickerId) {
    if (pickedStickerId === stickerId) { setPickedStickerId(null); return; }
    setPickedStickerId(stickerId);
    setPickedDecoId(null);
    setSelected(null);
  }
  function handleDecoTrayTap(decoId) {
    if (pickedDecoId === decoId) { setPickedDecoId(null); return; }
    setPickedDecoId(decoId);
    setPickedStickerId(null);
    setSelected(null);
  }

  // ─── Canvas tap to place ─────────────────────────────────────────────────
  function handleCanvasTap(e) {
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top)  / rect.height));
    if (pickedStickerId) {
      if (placedRef.current.length >= MAX_PER_PAGE) return;
      onUpdateRef.current([...placedRef.current, { stickerId: pickedStickerId, x, y, scale: 1.0, rotation: 0 }]);
    } else if (pickedDecoId) {
      onUpdateDecosRef.current([...decosRef.current, { decoId: pickedDecoId, x, y, scale: 1.0, rotation: 0 }]);
    }
  }

  // ─── Placed item pointer down (drag + long-press delete) ────────────────
  function handleItemPointerDown(e, index, type) {
    e.preventDefault();
    e.stopPropagation();
    setPickedStickerId(null);
    setPickedDecoId(null);
    longPressTimer.current = setTimeout(() => {
      dragRef.current = null;
      setGhostPos(null);
      if (type === 'sticker') {
        onUpdateRef.current(placedRef.current.filter((_, i) => i !== index));
      } else {
        onUpdateDecosRef.current(decosRef.current.filter((_, i) => i !== index));
      }
      setSelected(null);
    }, 600);
    const arr = type === 'sticker' ? placedRef.current : decosRef.current;
    const itemId = type === 'sticker' ? arr[index].stickerId : arr[index].decoId;
    dragRef.current = { type, itemId, index, startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY };
    setGhostPos({ x: e.clientX, y: e.clientY });
    setSelected({ type, index });
  }

  // ─── Pinch / rotate ──────────────────────────────────────────────────────
  function getTwoFingerInfo(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return { dist: Math.hypot(dx, dy), angle: Math.atan2(dy, dx) };
  }
  function handleCanvasTouchStart(e) {
    if (e.touches.length !== 2) return;
    e.preventDefault();
    clearTimeout(longPressTimer.current);
    dragRef.current = null;
    setGhostPos(null);
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const tx = e.touches[0].clientX, ty = e.touches[0].clientY;
    let hitType = null, hitIndex = -1;
    for (let i = decosRef.current.length - 1; i >= 0; i--) {
      const item = decosRef.current[i];
      const size = 40 * (item.scale ?? 1);
      const cx = rect.left + item.x * rect.width, cy = rect.top + item.y * rect.height;
      if (tx >= cx - size/2 && tx <= cx + size/2 && ty >= cy - size/2 && ty <= cy + size/2) {
        hitType = 'deco'; hitIndex = i; break;
      }
    }
    if (hitIndex < 0) {
      for (let i = placedRef.current.length - 1; i >= 0; i--) {
        const item = placedRef.current[i];
        const size = 64 * (item.scale ?? 1);
        const cx = rect.left + item.x * rect.width, cy = rect.top + item.y * rect.height;
        if (tx >= cx - size/2 && tx <= cx + size/2 && ty >= cy - size/2 && ty <= cy + size/2) {
          hitType = 'sticker'; hitIndex = i; break;
        }
      }
    }
    const arr = hitType === 'deco' ? decosRef.current : placedRef.current;
    const info = getTwoFingerInfo(e.touches);
    pinchRef.current = {
      type: hitType, placedIndex: hitIndex,
      startDist: info.dist, startAngle: info.angle,
      startScale: hitIndex >= 0 ? (arr[hitIndex]?.scale ?? 1) : 1,
      startRotation: hitIndex >= 0 ? (arr[hitIndex]?.rotation ?? 0) : 0,
    };
    if (hitIndex >= 0) setSelected({ type: hitType, index: hitIndex });
  }
  function handleCanvasTouchMove(e) {
    if (e.touches.length !== 2 || !pinchRef.current || pinchRef.current.placedIndex < 0) return;
    e.preventDefault();
    const info = getTwoFingerInfo(e.touches);
    const newScale = Math.max(0.3, Math.min(3.0,
      pinchRef.current.startScale * (info.dist / pinchRef.current.startDist)
    ));
    const newRotation = pinchRef.current.startRotation + ((info.angle - pinchRef.current.startAngle) * 180 / Math.PI);
    const idx = pinchRef.current.placedIndex;
    if (pinchRef.current.type === 'deco') {
      onUpdateDecosRef.current(decosRef.current.map((item, i) =>
        i === idx ? { ...item, scale: newScale, rotation: newRotation } : item
      ));
    } else {
      onUpdateRef.current(placedRef.current.map((item, i) =>
        i === idx ? { ...item, scale: newScale, rotation: newRotation } : item
      ));
    }
  }
  function handleCanvasTouchEnd() { pinchRef.current = null; }

  // ─── Control bar ─────────────────────────────────────────────────────────
  function handleScaleChange(val) {
    if (!selected) return;
    if (selected.type === 'sticker') {
      onUpdateRef.current(placed.map((item, i) => i === selected.index ? { ...item, scale: val } : item));
    } else {
      onUpdateDecosRef.current(decos.map((item, i) => i === selected.index ? { ...item, scale: val } : item));
    }
  }
  function handleRotate(delta) {
    if (!selected) return;
    if (selected.type === 'sticker') {
      onUpdateRef.current(placed.map((item, i) =>
        i === selected.index ? { ...item, rotation: ((item.rotation ?? 0) + delta + 360) % 360 } : item
      ));
    } else {
      onUpdateDecosRef.current(decos.map((item, i) =>
        i === selected.index ? { ...item, rotation: ((item.rotation ?? 0) + delta + 360) % 360 } : item
      ));
    }
  }
  function handleDeleteSelected() {
    if (!selected) return;
    if (selected.type === 'sticker') {
      onUpdateRef.current(placed.filter((_, i) => i !== selected.index));
    } else {
      onUpdateDecosRef.current(decos.filter((_, i) => i !== selected.index));
    }
    setSelected(null);
  }

  // ─── Auto-arrange / bulk scale ───────────────────────────────────────────
  function handleAutoArrange() {
    if (placed.length === 0) return;
    const n = placed.length;
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const scale = Math.max(0.4, Math.min(1.2, 2.5 / cols));
    const mx = 0.1, my = 0.1;
    onUpdateRef.current(placed.map((item, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      return {
        ...item, rotation: 0, scale,
        x: cols === 1 ? 0.5 : mx + (col / (cols - 1)) * (1 - 2 * mx),
        y: rows === 1 ? 0.5 : my + (row / (rows - 1)) * (1 - 2 * my),
      };
    }));
    setSelected(null);
  }
  function handleBulkScale(val) {
    if (placed.length === 0) return;
    onUpdateRef.current(placed.map(item => ({ ...item, scale: val })));
  }

  // ─── Derived values ───────────────────────────────────────────────────────
  const selectedItem = selected !== null
    ? (selected.type === 'sticker' ? placed[selected.index] : decos[selected.index])
    : null;
  const pageColor = PAGE_COLORS[colorIndex ?? 0] ?? PAGE_COLORS[0];
  const ghostItem = ghostPos && dragRef.current
    ? (dragRef.current.type === 'deco' ? decoMap[dragRef.current.itemId] : stickerMap[dragRef.current.itemId])
    : null;
  const pickedSticker = pickedStickerId ? stickerMap[pickedStickerId] : null;
  const pickedDeco = pickedDecoId ? decoMap[pickedDecoId] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 6 }}>

      {/* カラーピッカー */}
      {showColorPicker && (
        <div style={{
          padding: '8px 10px',
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 12, border: '1.5px solid #e5e7eb',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)', flexShrink: 0,
        }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6b7280', marginBottom: 6 }}>ページのいろ</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PAGE_COLORS.map((c, i) => (
              <button key={i} onClick={() => { onUpdateColor(i); setShowColorPicker(false); }} style={{
                width: 34, height: 34, borderRadius: '50%',
                background: c.border,
                border: (colorIndex ?? 0) === i ? '3px solid #374151' : '3px solid rgba(0,0,0,0.08)',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                transform: (colorIndex ?? 0) === i ? 'scale(1.25)' : 'scale(1)',
                transition: 'transform 0.15s',
              }} />
            ))}
          </div>
        </div>
      )}

      {/* 選択中コントロールバー */}
      {selectedItem && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 12, border: '1.5px solid var(--pink-200)',
          boxShadow: 'var(--shadow-sm)', flexShrink: 0,
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--pink-400)', fontWeight: 800, flexShrink: 0 }}>サイズ</span>
          <input type="range" min={0.3} max={3.0} step={0.05}
            value={selectedItem.scale ?? 1.0}
            onChange={e => handleScaleChange(parseFloat(e.target.value))}
            style={{ flex: 1, minWidth: 50, accentColor: 'var(--pink-500)', cursor: 'pointer' }} />
          <button onClick={() => handleRotate(-15)} style={btnStyle}>↺</button>
          <button onClick={() => handleRotate(15)} style={btnStyle}>↻</button>
          <button onClick={handleDeleteSelected} style={{ ...btnStyle, background: '#fce7f3', color: '#9d174d' }}>🗑️</button>
          <button onClick={() => setSelected(null)} style={{ ...btnStyle, background: '#f3f4f6', color: '#9ca3af' }}>✕</button>
        </div>
      )}

      {/* ピック中バナー */}
      {(pickedSticker || pickedDeco) && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px',
          background: 'rgba(254,249,195,0.9)', backdropFilter: 'blur(8px)',
          borderRadius: 12, border: '1.5px solid #fbbf24',
          boxShadow: '0 2px 8px rgba(251,191,36,0.2)', flexShrink: 0,
        }}>
          {pickedSticker
            ? <img src={pickedSticker.imagePath} alt={pickedSticker.name} style={{ width: 30, height: 30, objectFit: 'contain' }} />
            : <span style={{ fontSize: 24 }}>{pickedDeco?.emoji}</span>
          }
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400e', flex: 1 }}>
            「{pickedSticker?.name ?? pickedDeco?.emoji}」をタップしてはろう！
          </span>
          <button onClick={() => { setPickedStickerId(null); setPickedDecoId(null); }}
            style={{ ...btnStyle, background: 'transparent', color: '#b45309' }}>✕</button>
        </div>
      )}

      {/* ツールバー */}
      {placed.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
          background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
          borderRadius: 12, border: '1.5px solid #ddd6fe',
          boxShadow: 'var(--shadow-sm)', flexShrink: 0,
        }}>
          <button onClick={handleAutoArrange} style={{
            background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#6d28d9',
            border: '1px solid #c4b5fd', borderRadius: 8, padding: '4px 10px',
            fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
          }}>📐 ならべる</button>
          <span style={{ fontSize: '0.68rem', color: '#7c3aed', fontWeight: 700, flexShrink: 0 }}>サイズ</span>
          <input type="range" min={0.3} max={3.0} step={0.05} defaultValue={1.0}
            onChange={e => handleBulkScale(parseFloat(e.target.value))}
            style={{ flex: 1, minWidth: 50, accentColor: '#7c3aed', cursor: 'pointer' }} />
        </div>
      )}

      {/* シール帳ページ */}
      <div style={{
        flex: 1, minHeight: 0,
        background: pageColor.border, borderRadius: 20, padding: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
        position: 'relative',
      }}>
        {/* 🎨 カラーボタン */}
        <button onClick={() => setShowColorPicker(v => !v)} style={{
          position: 'absolute', top: 14, right: 14,
          width: 32, height: 32, borderRadius: '50%',
          background: 'white', border: '2px solid ' + pageColor.border,
          fontSize: 16, cursor: 'pointer', zIndex: 3,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>🎨</button>

        {/* ページ番号 */}
        <div style={{
          position: 'absolute', bottom: 14, right: 18,
          fontSize: '0.65rem', fontWeight: 800,
          color: pageColor.border, background: 'white',
          borderRadius: 20, padding: '2px 8px',
          opacity: 0.8, zIndex: 2, pointerEvents: 'none',
        }}>{pageIndex + 1}</div>

        {/* キャンバス */}
        <div ref={pageRef} style={{
          height: '100%', position: 'relative',
          background: pageColor.bg,
          backgroundImage: `radial-gradient(circle, ${pageColor.dot} 1.2px, transparent 1.2px)`,
          backgroundSize: '22px 22px', borderRadius: 13, overflow: 'hidden',
          touchAction: 'none', userSelect: 'none',
          cursor: (pickedStickerId || pickedDecoId) ? 'crosshair' : 'default',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)',
        }}
          onClick={handleCanvasTap}
          onTouchStart={handleCanvasTouchStart}
          onTouchMove={handleCanvasTouchMove}
          onTouchEnd={handleCanvasTouchEnd}
        >
          {/* 貼られたシール */}
          {placed.map((item, i) => {
            const sticker = stickerMap[item.stickerId];
            if (!sticker) return null;
            const size = 64 * (item.scale ?? 1);
            const isSel = selected?.type === 'sticker' && selected?.index === i;
            return (
              <div key={`s-${i}`} style={{
                position: 'absolute',
                left: `calc(${item.x * 100}% - ${size/2}px)`,
                top:  `calc(${item.y * 100}% - ${size/2}px)`,
                width: size, height: size, cursor: 'grab',
                borderRadius: 12, zIndex: isSel ? 10 : 1,
                transform: `rotate(${item.rotation ?? 0}deg)`,
                filter: isSel
                  ? 'drop-shadow(0 0 8px #ec4899) drop-shadow(0 0 16px rgba(236,72,153,0.5))'
                  : 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))',
              }} onPointerDown={e => handleItemPointerDown(e, i, 'sticker')}>
                <img src={sticker.imagePath} alt={sticker.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                  draggable={false} />
              </div>
            );
          })}

          {/* 貼られた飾り */}
          {decos.map((item, i) => {
            const deco = decoMap[item.decoId];
            if (!deco) return null;
            const size = 40 * (item.scale ?? 1);
            const isSel = selected?.type === 'deco' && selected?.index === i;
            return (
              <div key={`d-${i}`} style={{
                position: 'absolute',
                left: `calc(${item.x * 100}% - ${size/2}px)`,
                top:  `calc(${item.y * 100}% - ${size/2}px)`,
                width: size, height: size, cursor: 'grab',
                zIndex: isSel ? 11 : 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: size * 0.85,
                transform: `rotate(${item.rotation ?? 0}deg)`,
                filter: isSel ? 'drop-shadow(0 0 6px #fbbf24)' : 'none',
              }} onPointerDown={e => handleItemPointerDown(e, i, 'deco')}>
                {deco.emoji}
              </div>
            );
          })}

          {placed.length === 0 && decos.length === 0 && !pickedStickerId && !pickedDecoId && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              color: '#d1d5db', fontWeight: 'bold', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: '2.5rem' }}>🩷</div>
              <div style={{ fontSize: '0.9rem' }}>下のシールをタップしてえらんでね！</div>
            </div>
          )}
          {(pickedStickerId || pickedDecoId) && placed.length === 0 && decos.length === 0 && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              color: '#f59e0b', fontWeight: 'bold', pointerEvents: 'none',
            }}>
              <div style={{ fontSize: '2.5rem' }}>👆</div>
              <div style={{ fontSize: '0.9rem' }}>ここをタップしてはろう！</div>
            </div>
          )}
        </div>
      </div>

      {/* ドラッグ中ゴースト */}
      {ghostItem && ghostPos && (
        <div style={{
          position: 'fixed', left: ghostPos.x - 40, top: ghostPos.y - 40,
          width: 80, height: 80, pointerEvents: 'none',
          opacity: 0.82, zIndex: 9999,
          filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.4))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {ghostItem.imagePath
            ? <img src={ghostItem.imagePath} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable={false} />
            : <span style={{ fontSize: 56 }}>{ghostItem.emoji}</span>
          }
        </div>
      )}

      {/* トレイ（シール / かざりタブ） */}
      <div style={{
        background: 'white', borderRadius: 14,
        border: `2px solid ${pageColor.border}`, flexShrink: 0,
      }}>
        {/* タブ */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${pageColor.border}` }}>
          {[['stickers', '🏷️ シール'], ['decos', '✨ かざり']].map(([tab, label]) => (
            <button key={tab} onClick={() => setTrayTab(tab)} style={{
              flex: 1, padding: '6px 0', border: 'none', cursor: 'pointer',
              background: trayTab === tab ? pageColor.border : 'transparent',
              fontSize: '0.75rem', fontWeight: 800,
              color: trayTab === tab ? '#374151' : '#9ca3af',
              borderRadius: tab === 'stickers' ? '12px 0 0 0' : '0 12px 0 0',
              transition: 'background 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {/* トレイ内容 */}
        <div style={{
          overflowX: 'auto', display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', minHeight: 72,
        }}>
          {trayTab === 'stickers' ? (
            collection.length === 0
              ? <div style={{ color: '#9ca3af', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>ガチャでシールを集めよう！</div>
              : collection.map((id, idx) => {
                  const sticker = stickerMap[id];
                  if (!sticker) return null;
                  const isPicked = pickedStickerId === id;
                  return (
                    <div key={`${id}-${idx}`} onClick={() => handleTrayTap(id)} style={{
                      flexShrink: 0, width: 52, height: 52, cursor: 'pointer', borderRadius: 10,
                      border: isPicked ? '3px solid #f59e0b' : '3px solid transparent',
                      background: isPicked ? '#fef9c3' : 'transparent',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                      transition: 'all 0.15s',
                      transform: isPicked ? 'scale(1.12)' : 'scale(1)',
                    }}>
                      <img src={sticker.imagePath} alt={sticker.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                        draggable={false} />
                    </div>
                  );
                })
          ) : (
            DECOS.map(deco => {
              const isPicked = pickedDecoId === deco.id;
              return (
                <button key={deco.id} onClick={() => handleDecoTrayTap(deco.id)} style={{
                  flexShrink: 0, width: 52, height: 52, cursor: 'pointer', borderRadius: 10,
                  border: isPicked ? '3px solid #f59e0b' : '3px solid #e5e7eb',
                  background: isPicked ? '#fef9c3' : '#f9fafb',
                  transition: 'all 0.15s',
                  transform: isPicked ? 'scale(1.12)' : 'scale(1)',
                  fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {deco.emoji}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  border: 'none', background: 'var(--pink-100)', color: 'var(--pink-800)',
  borderRadius: 8, padding: '5px 10px',
  fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer',
  whiteSpace: 'nowrap', lineHeight: 1,
};
