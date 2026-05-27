import React from 'react';

const DefaultAvatar = ({ gender, className = '' }) => {
  const isFemale = gender === 'female';

  if (isFemale) {
    return (
      <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#e2e8f0"/>
        {/* Body/Shoulders */}
        <path d="M20 100C20 75 35 65 50 65C65 65 80 75 80 100Z" fill="#94a3b8"/>
        {/* Hijab Drape */}
        <path d="M25 60C25 40 35 15 50 15C65 15 75 40 75 60C75 80 65 85 50 90C35 85 25 80 25 60Z" fill="#64748b"/>
        {/* Face cutout */}
        <path d="M50 25C40 25 35 35 35 45C35 55 40 65 50 65C60 65 65 55 65 45C65 35 60 25 50 25Z" fill="#cbd5e1"/>
      </svg>
    );
  }
  
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#e2e8f0"/>
      {/* Body/Shoulders */}
      <path d="M15 100C15 75 35 65 50 65C65 65 85 75 85 100Z" fill="#64748b"/>
      {/* Face/Head */}
      <circle cx="50" cy="40" r="20" fill="#cbd5e1"/>
      {/* Beard */}
      <path d="M30 40C30 65 40 70 50 75C60 70 70 65 70 40Z" fill="#475569"/>
      {/* Face Overlap */}
      <circle cx="50" cy="38" r="19" fill="#cbd5e1"/>
      {/* Kufi (Cap) */}
      <path d="M32 30C32 15 40 15 50 15C60 15 68 15 68 30C68 35 32 35 32 30Z" fill="#f8fafc"/>
    </svg>
  );
};

export default DefaultAvatar;
