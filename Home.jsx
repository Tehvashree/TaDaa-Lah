import React from 'react';

export default function Home() {
  return (
    <div style={{
      width: '100%',
      maxWidth: '1440px',
      height: '924px', // Total height minus navbar (1024 - 100)
      background: '#F9F9F9',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Vector */}
      <img 
        src="https://api.builder.io/api/v1/image/assets/TEMP/26de038695ba81719ed45aabf48364caa94eda0e?width=2116" 
        style={{
          width: '1058px',
          height: '1221px',
          transform: 'rotate(8.059deg)',
          flexShrink: 0,
          fill: 'rgba(212, 81, 97, 0.05)',
          position: 'absolute',
          left: '-495px',
          top: '-87px'
        }} 
        alt="Vector" 
      />

      {/* Main Content */}
      <div style={{
        width: '751px',
        height: '154px',
        flexShrink: 0,
        position: 'absolute',
        left: '80px',
        top: '355px' // Adjusted for navbar height (455 - 100)
      }}>
        <div style={{
          width: '751px',
          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
          fontSize: '64px',
          fontStyle: 'normal',
          fontWeight: '700',
          lineHeight: 'normal',
          position: 'absolute',
          left: '0px',
          top: '0px',
          height: '154px'
        }}>
          <span style={{
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            fontWeight: '700',
            fontSize: '64px',
            color: 'rgba(34,34,34,1)'
          }}>
            Your Safety isn't MAGIC{'\n'}
          </span>
          <span style={{
            fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
            fontWeight: '700',
            fontSize: '64px',
            color: 'rgba(221,66,85,1)'
          }}>
            ...... it's verified
          </span>
        </div>
      </div>

      {/* Right side image */}
      <img 
        src="https://api.builder.io/api/v1/image/assets/TEMP/f9cc4fb779e0a7470eeca0a33012b89b37fe4051?width=1024" 
        style={{
          width: '512px',
          height: '512px',
          flexShrink: 0,
          aspectRatio: '1/1',
          position: 'absolute',
          left: '865px',
          top: '176px' // Adjusted for navbar height (276 - 100)
        }} 
        alt="" 
      />
    </div>
  );
}
