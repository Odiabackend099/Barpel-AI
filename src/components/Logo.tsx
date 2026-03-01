'use client';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  variant?: 'dark' | 'light';
}

export default function Logo({
  className = '',
  width = 150,
  height = 40,
  showText = true,
  variant = 'dark',
}: LogoProps) {
  const iconSize = Math.round(height * 0.9);
  const textColor = variant === 'light' ? 'text-white' : 'text-[#102A33]';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className="flex-shrink-0"
        style={{ width: iconSize, height: iconSize }}
      >
        <Image
          src="/images/logos/logo_master_transparent.png"
          alt="Barpel AI"
          width={iconSize}
          height={iconSize}
          className="object-contain w-full h-full"
          priority
        />
      </div>
      {showText && (
        <span
          className={`font-semibold whitespace-nowrap ${textColor}`}
          style={{ fontSize: height * 0.45 }}
        >
          Barpel AI
        </span>
      )}
    </div>
  );
}
