import { ImageResponse } from 'next/og';

export const alt = 'Dnyx Draft — Local-First Markdown Editor & Live Previewer';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#090d16',
        backgroundImage:
          'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(59, 130, 246, 0.15) 5%, transparent 0%)',
        backgroundSize: '100px 100px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
        padding: '40px 80px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1, #9333ea)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            fontWeight: 'bold',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
          }}
        >
          MD
        </div>
        <span
          style={{
            fontSize: '44px',
            fontWeight: 800,
            letterSpacing: '-1px',
          }}
        >
          Dnyx Draft
        </span>
      </div>

      <div
        style={{
          fontSize: '28px',
          color: '#94a3b8',
          maxWidth: '850px',
          lineHeight: '1.4',
          marginBottom: '32px',
        }}
      >
        Local-First Markdown Editor with GFM, LaTeX KaTeX Math, Mermaid Diagrams &amp; Native Word
        (.docx) Export.
      </div>

      <div
        style={{
          display: 'flex',
          gap: '12px',
        }}
      >
        {['100% Client-Side', 'Zero Backend', 'IndexedDB Vault', 'Marp Slides'].map((tag, i) => (
          <div
            key={i}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              background: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              fontSize: '16px',
              fontWeight: 600,
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
