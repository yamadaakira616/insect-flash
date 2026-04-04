import { useState } from 'react';
import StickerBookPage from '../components/StickerBookPage.jsx';

const TOTAL_PAGES = 5;

export default function StickerBookScreen({ state, onBack, onUpdatePage }) {
  const [pageIndex, setPageIndex] = useState(0);
  const placed = state.bookPages?.[pageIndex] ?? [];

  return (
    <div style={{ height: '100svh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(168deg, #fdf2f8 0%, #fce7f3 40%, #f5f0ff 100%)' }}>

      {/* ヘッダー */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px',
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
            width: 36, height: 36, borderRadius: '50%',
            background: 'white', border: '1.5px solid var(--pink-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
          }}
        >←</button>
        <h2 style={{ fontWeight: 900, fontSize: '1.1rem', margin: 0, color: 'var(--pink-800)' }}>
          シールブック
        </h2>

        {/* ページナビ（ヘッダー内） */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {Array.from({ length: TOTAL_PAGES }, (_, i) => (
            <button
              key={i}
              onClick={() => setPageIndex(i)}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                border: 'none', cursor: 'pointer',
                fontWeight: 900, fontSize: '0.75rem',
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
          collection={state.collection}
          onUpdate={newPlaced => onUpdatePage(pageIndex, newPlaced)}
        />
      </div>
    </div>
  );
}
