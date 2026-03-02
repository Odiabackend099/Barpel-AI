import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const alt = 'Barpel AI - The #1 AI Receptionist for Clinics & Spas'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

// Image generation
export default async function Image() {
  // Fetch the Barpel logo (required for Edge Runtime)
  const logoUrl = new URL('/images/logos/logo_master_transparent.png', 'https://barpel.ai').toString()
  const logoResponse = await fetch(logoUrl)
  const logoArrayBuffer = await logoResponse.arrayBuffer()
  const logoBase64 = Buffer.from(logoArrayBuffer).toString('base64')
  const logoDataUrl = `data:image/png;base64,${logoBase64}`

  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 60,
          background: '#F0FAF9', // Light teal background
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 60px',
          position: 'relative',
        }}
      >
        {/* Gradient accent (teal) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at 30% 50%, rgba(55, 161, 149, 0.15) 0%, transparent 50%)',
            opacity: 0.6,
          }}
        />

        {/* Content container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Barpel Logo - Actual brand logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '50px',
              background: 'white',
              padding: '30px 60px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(55, 161, 149, 0.3)',
            }}
          >
            <img
              src={logoDataUrl}
              alt="Barpel AI"
              width="400"
              height="100"
              style={{
                objectFit: 'contain',
              }}
            />
          </div>

          {/* Main headline - Bold and prominent */}
          <div
            style={{
              fontSize: 60,
              fontWeight: 900,
              color: '#102A33',
              lineHeight: 1.2,
              marginBottom: '28px',
              maxWidth: '1000px',
              letterSpacing: '-0.03em',
              textShadow: 'none',
            }}
          >
            The #1 AI Receptionist for Clinics & Spas
          </div>

          {/* Subtext - Enhanced visibility */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: '#6B7280', // Muted gray for better readability on light bg
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              letterSpacing: '0.01em',
            }}
          >
            <span>24/7 Call Answering</span>
            <span style={{ color: '#37A195', fontSize: '36px' }}>•</span>
            <span>Appointment Booking</span>
            <span style={{ color: '#37A195', fontSize: '36px' }}>•</span>
            <span>HIPAA Compliant</span>
          </div>

          {/* Bottom accent line - More prominent */}
          <div
            style={{
              marginTop: '50px',
              width: '300px',
              height: '6px',
              background: 'linear-gradient(90deg, transparent 0%, #37A195 50%, transparent 100%)',
              borderRadius: '3px',
              boxShadow: '0 0 20px rgba(55, 161, 149, 0.6)',
            }}
          />
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
