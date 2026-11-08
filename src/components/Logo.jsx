import React from 'react';

/**
 * Premium Scalable BriefMeet AI Logo
 * 
 * Features an architectural monogram combining the 'B' & 'M' geometry,
 * an executive briefing fold, and an intelligence sparkle core node.
 * 100% scalable SVG ensures razor-sharp rendering on Retina/4K displays.
 */
export function BrandIcon({ size = 34, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 ease-out group-hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      {/* Container badge in charcoal with warm gold micro-border */}
      <rect 
        x="1.5" 
        y="1.5" 
        width="37" 
        height="37" 
        rx="10" 
        fill="#302015" 
        stroke="#C29B48" 
        strokeWidth="1.2" 
        strokeOpacity="0.38"
      />

      {/* Backbone stem representing document edge & 'B' */}
      <path 
        d="M9 11V29" 
        stroke="#F5F0E6" 
        strokeWidth="2.3" 
        strokeLinecap="round"
      />

      {/* Top loop of 'B' */}
      <path 
        d="M9 12H14C20 12 20 20 14 20H9" 
        stroke="#F5F0E6" 
        strokeWidth="2.1" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Bottom loop of 'B' */}
      <path 
        d="M9 20H14C21 20 21 29 14 29H9" 
        stroke="#F5F0E6" 
        strokeWidth="2.1" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Diagonal forward chevron forming 'M' fold in muted gold */}
      <path 
        d="M21 29V12L26 23L31 12V29" 
        stroke="#C29B48" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* AI Intelligence Core Node */}
      <path 
        d="M28 9.5L28.8 11.7L31 12.5L28.8 13.3L28 15.5L27.2 13.3L25 12.5L27.2 11.7L28 9.5Z" 
        fill="#C29B48"
      />
    </svg>
  );
}

export default function Logo({ 
  size = "md", 
  showTagline = false, 
  variant = "full", 
  className = "" 
}) {
  const iconSizes = {
    sm: 28,
    md: 42,
    lg: 58
  };

  const currentIconSize = iconSizes[size] || iconSizes.md;

  if (variant === "icon") {
    return <BrandIcon size={currentIconSize} className={className} />;
  }

  return (
    <div className={`flex items-center brand-lockup space-x-3 select-none group ${className}`}>
      <BrandIcon size={currentIconSize} />
      
      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5 leading-none">
          <span className="brand-wordmark font-serif font-bold text-lg sm:text-[19px] text-charcoal-900 tracking-tight transition-colors duration-200 group-hover:text-black">
            BriefMeet
          </span>
          <span className="brand-ai font-serif text-gold-muted">
            AI
          </span>
        </div>
        
        {showTagline && (
          <span className="brand-tagline text-charcoal-700 font-medium mt-1">
            Pre-Meeting Research
          </span>
        )}
      </div>
    </div>
  );
}
