import Welaa from '../welaa';

type PageProps = { params: Promise<{ path?: string[] }> };

export default async function Page({ params }: PageProps) {
  const { path = [] } = await params;

  if (path.length > 0) return <Welaa />;

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: '#f7f7f5',
        color: '#111',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section style={{ maxWidth: 720, padding: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 56, margin: '0 0 12px' }}>WELAA</h1>
        <p style={{ fontSize: 20, lineHeight: 1.6, color: '#555' }}>Coming soon..</p>
        <span
          style={{
            display: 'inline-block',
            marginTop: 18,
            padding: '10px 16px',
            borderRadius: 999,
            background: '#111',
            color: '#fff',
            fontSize: 14,
          }}
        >
          Coming soon
        </span>
      </section>
    </main>
  );
}
