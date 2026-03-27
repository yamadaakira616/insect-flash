// src/screens/StickerBookScreen.jsx
import { useState } from 'react';
import StickerBookPage from '../components/StickerBookPage.jsx';

const TOTAL_PAGES = 5;

export default function StickerBookScreen({ state, onBack, onUpdatePage }) {
  const [pageIndex, setPageIndex] = useState(0);

  const placed = state.bookPages?.[pageIndex] ?? [];

  function handleUpdate(newPlaced) {
    onUpdatePage(pageIndex, newPlaced);
  }

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #fce7f3 0%, #fdf2f8 100%)',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #f472b6, #ec4899)',
          color: 'white',
          flexShrink: 0,
        }}
      >
        <button onClick={onBack} aria-label="もどる" style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>←</button>
        <h2 style={{ fontWeight: 900, fontSize: '1.2rem', margin: 0 }}>📖 シールブック</h2>
        <div style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.9rem' }}>
          {pageIndex + 1} / {TOTAL_PAGES}
        </div>
      </div>

      {/* ページ切替ナビ */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '8px 0', flexShrink: 0 }}>
        {Array.from({ length: TOTAL_PAGES }, (_, i) => (
          <button
            key={i}
            onClick={() => setPageIndex(i)}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: '0.75rem',
              background: i === pageIndex ? '#ec4899' : '#fbcfe8',
              color: i === pageIndex ? 'white' : '#9d174d',
              transition: 'all 0.2s',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ページ本体 */}
      <div style={{ flex: 1, padding: '0 12px 12px', minHeight: 0 }}>
        <StickerBookPage
          pageIndex={pageIndex}
          placed={placed}
          collection={state.collection}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}
