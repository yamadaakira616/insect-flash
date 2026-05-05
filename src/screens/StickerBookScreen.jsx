import { useState } from 'react';
import StickerBookPage from '../components/StickerBookPage.jsx';

const TOTAL_PAGES = 10;

export default function StickerBookScreen({ state, onBack, onUpdatePage }) {
  const [pageIndex, setPageIndex] = useState(0);
  const pageData = state.bookPages?.[pageIndex] ?? { placed: [], colorIndex: 0, decos: [] };
  const placed = Array.isArray(pageData) ? pageData : (pageData.placed ?? []);
  const colorIndex = Array.isArray(pageData) ? 0 : (pageData.colorIndex ?? 0);
  const decos = Array.isArray(pageData) ? [] : (pageData.decos ?? []);

  return (
    <div style={{ height: '100svh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(168deg, #fdf2f8 0%, #fce7f3 40%, #f5f0ff 100%)' }}>

      {/* ヘッダー */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        background: 'rgba(253,242,248,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(251,207,232,0.5)',
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          aria-label="もどる"
          style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'white', border: '1.5px solid var(--pink-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
          }}
        >←</button>

        {/* ページナビ（横スクロール） */}
        <div style={{ flex: 1, overflowX: 'auto', display: 'flex', gap: 5, paddingBottom: 2 }}>
          {Array.from({ length: TOTAL_PAGES }, (_, i) => (
            <button
              key={i}
              onClick={() => setPageIndex(i)}
              style={{
                flexShrink: 0,
                width: 28, height: 28, borderRadius: '50%',
                cursor: 'pointer',
                fontWeight: 900, fontSize: '0.72rem',
                background: i === pageIndex
                  ? 'linear-gradient(135deg, var(--pink-400), var(--pink-500))'
                  : 'white',
                color: i === pageIndex ? 'white' : 'var(--pink-600)',
                boxShadow: i === pageIndex ? 'var(--shadow-glow-pink)' : 'var(--shadow-sm)',
                border: i === pageIndex ? 'none' : '1.5px solid var(--pink-200)',
                transition: 'all 0.2s ease',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* ページ本体 */}
      <div style={{ flex: 1, padding: '10px 12px 12px', minHeight: 0 }}>
        <StickerBookPage
          pageIndex={pageIndex}
          placed={placed}
          colorIndex={colorIndex}
          decos={decos}
          collection={state.collection}
          onUpdate={newPlaced => onUpdatePage(pageIndex, { placed: newPlaced })}
          onUpdateColor={ci => onUpdatePage(pageIndex, { colorIndex: ci })}
          onUpdateDecos={newDecos => onUpdatePage(pageIndex, { decos: newDecos })}
        />
      </div>
    </div>
  );
}
