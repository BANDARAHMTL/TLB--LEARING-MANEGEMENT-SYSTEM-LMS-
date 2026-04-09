// Spinner.jsx
export function Spinner({ size = 40 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
      <div style={{
        width: size, height: size,
        border: `3px solid rgba(108,77,230,0.2)`,
        borderTop: `3px solid var(--primary)`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// CourseCardSkeleton.jsx
export function CourseCardSkeleton() {
  return (
    <div style={{
      background: 'var(--gradient-card)',
      border: '1px solid var(--border-light)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>
      <div className="skeleton" style={{ aspectRatio: '16/9', width: '100%' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="skeleton" style={{ height: '12px', width: '60%', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '16px', width: '90%', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '16px', width: '70%', borderRadius: '6px' }} />
        <div className="skeleton" style={{ height: '12px', width: '40%', borderRadius: '6px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
          <div className="skeleton" style={{ height: '20px', width: '80px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ height: '28px', width: '90px', borderRadius: '50px' }} />
        </div>
      </div>
    </div>
  );
}
