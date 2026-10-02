export const AVATAR_LIST = [
  { id: "female_1", name: "Rose", gender: "female", label: "Athletic Girl" },
  { id: "female_2", name: "Chloe", gender: "female", label: "Curly & Glasses" },
  { id: "female_3", name: "Maya", gender: "female", label: "Stylish Bob" },
  { id: "female_4", name: "Sophia", gender: "female", label: "Wavy & Beanie" },
  { id: "female_5", name: "Zara", gender: "female", label: "Top Bun & Music" },

  { id: "male_1", name: "Alex", gender: "male", label: "Gym & Cap" },
  { id: "male_2", name: "Liam", gender: "male", label: "Curly & Glasses" },
  { id: "male_3", name: "Ethan", gender: "male", label: "Trim Beard & Smile" },
  { id: "male_4", name: "Noah", gender: "male", label: "Warm & Beanie" },
  { id: "male_5", name: "Leo", gender: "male", label: "Headphones Bro" },
];

export default function AvatarRender({ avatarId = "female_1", size = 120, className = "" }) {
  // Determine avatar config
  const id = avatarId || "female_1";
  const isFemale = id.startsWith("female");

  if (id === "female_1") {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" className={`avatar-svg-element ${className}`}>
        <defs>
          <linearGradient id="f1Skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDDFCF" />
            <stop offset="100%" stopColor="#F5C3A8" />
          </linearGradient>
          <linearGradient id="f1Hair" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4A2E18" />
            <stop offset="100%" stopColor="#25140A" />
          </linearGradient>
          <linearGradient id="f1Bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1E4725" />
            <stop offset="100%" stopColor="#112414" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="76" fill="url(#f1Bg)" stroke="#4ECC60" strokeWidth="3" />
        {/* Ponytail Hair */}
        <path d="M110 50 C135 40 145 80 132 110 C122 95 115 75 110 60 Z" fill="url(#f1Hair)" />
        {/* Body */}
        <path d="M40 150 C40 120 65 110 80 110 C95 110 120 120 120 150 Z" fill="#4ECC60" />
        <path d="M70 110 L80 124 L90 110 Z" fill="#FDDFCF" />
        {/* Face */}
        <ellipse cx="80" cy="76" rx="28" ry="32" fill="url(#f1Skin)" />
        {/* Hair Bangs */}
        <path d="M52 70 C52 48 64 36 80 36 C96 36 108 48 108 70 C100 54 90 54 80 56 C70 54 60 54 52 70 Z" fill="url(#f1Hair)" />
        {/* Headband */}
        <path d="M52 58 C62 50 98 50 108 58" stroke="#4ECC60" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Eyes */}
        <ellipse cx="68" cy="74" rx="3.5" ry="4.5" fill="#1B2A1C" />
        <circle cx="67" cy="72.5" r="1.5" fill="#FFF" />
        <ellipse cx="92" cy="74" rx="3.5" ry="4.5" fill="#1B2A1C" />
        <circle cx="91" cy="72.5" r="1.5" fill="#FFF" />
        {/* Cheeks */}
        <circle cx="62" cy="82" r="4.5" fill="#F87171" opacity="0.4" />
        <circle cx="98" cy="82" r="4.5" fill="#F87171" opacity="0.4" />
        {/* Smile */}
        <path d="M74 87 Q80 93 86 87" stroke="#A1432A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === "female_2") {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" className={`avatar-svg-element ${className}`}>
        <defs>
          <linearGradient id="f2Skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F7D3BE" />
            <stop offset="100%" stopColor="#E0AC93" />
          </linearGradient>
          <linearGradient id="f2Hair" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2D1F17" />
            <stop offset="100%" stopColor="#140C08" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="76" fill="#1C3822" stroke="#FBBF24" strokeWidth="3" />
        {/* Curly Hair volume */}
        <circle cx="50" cy="60" r="24" fill="url(#f2Hair)" />
        <circle cx="110" cy="60" r="24" fill="url(#f2Hair)" />
        <circle cx="80" cy="42" r="26" fill="url(#f2Hair)" />
        {/* Body */}
        <path d="M42 150 C42 122 65 112 80 112 C95 112 118 122 118 150 Z" fill="#FBBF24" />
        <path d="M70 112 L80 125 L90 112 Z" fill="#F7D3BE" />
        {/* Face */}
        <ellipse cx="80" cy="78" rx="28" ry="32" fill="url(#f2Skin)" />
        {/* Bangs */}
        <path d="M54 68 C58 50 102 50 106 68 C96 56 64 56 54 68 Z" fill="url(#f2Hair)" />
        {/* Glasses */}
        <circle cx="68" cy="74" r="9" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="92" cy="74" r="9" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
        <line x1="77" y1="74" x2="83" y2="74" stroke="#FFFFFF" strokeWidth="2.5" />
        {/* Eyes */}
        <circle cx="68" cy="74" r="3" fill="#2D1F17" />
        <circle cx="92" cy="74" r="3" fill="#2D1F17" />
        {/* Smile */}
        <path d="M73 88 Q80 95 87 88" stroke="#9A3C23" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === "female_3") {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" className={`avatar-svg-element ${className}`}>
        <defs>
          <linearGradient id="f3Skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE0CE" />
            <stop offset="100%" stopColor="#F5C4AC" />
          </linearGradient>
          <linearGradient id="f3Hair" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3A21" />
            <stop offset="100%" stopColor="#4A1E0E" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="76" fill="#183624" stroke="#38BDF8" strokeWidth="3" />
        {/* Bob Hair Back */}
        <path d="M48 60 C48 40 112 40 112 60 L116 95 C116 102 108 105 102 98 L100 80 L60 80 L58 98 C52 105 44 102 44 95 Z" fill="url(#f3Hair)" />
        {/* Body */}
        <path d="M42 150 C42 122 65 112 80 112 C95 112 118 122 118 150 Z" fill="#38BDF8" />
        <path d="M68 112 L80 126 L92 112 Z" fill="#FFE0CE" />
        {/* Face */}
        <ellipse cx="80" cy="78" rx="27" ry="31" fill="url(#f3Skin)" />
        {/* Hair Bangs */}
        <path d="M53 65 C58 48 102 48 107 65 C96 52 64 52 53 65 Z" fill="url(#f3Hair)" />
        {/* Eyes */}
        <ellipse cx="68" cy="74" rx="3.5" ry="4.5" fill="#1E2A1F" />
        <circle cx="67" cy="72.5" r="1.5" fill="#FFF" />
        <ellipse cx="92" cy="74" rx="3.5" ry="4.5" fill="#1E2A1F" />
        <circle cx="91" cy="72.5" r="1.5" fill="#FFF" />
        {/* Cheeks */}
        <circle cx="62" cy="82" r="4" fill="#F87171" opacity="0.4" />
        <circle cx="98" cy="82" r="4" fill="#F87171" opacity="0.4" />
        {/* Smile */}
        <path d="M72 87 Q80 96 88 87" stroke="#A84328" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === "female_4") {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" className={`avatar-svg-element ${className}`}>
        <defs>
          <linearGradient id="f4Skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FBE3D3" />
            <stop offset="100%" stopColor="#E2B7A0" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="76" fill="#1A3320" stroke="#C084FC" strokeWidth="3" />
        {/* Wavy Long Hair */}
        <path d="M42 65 C38 90 44 120 54 135 C58 135 64 120 60 95 L100 95 C96 120 102 135 106 135 C116 120 122 90 118 65 Z" fill="#2C1B12" />
        {/* Body */}
        <path d="M42 150 C42 122 65 112 80 112 C95 112 118 122 118 150 Z" fill="#C084FC" />
        {/* Face */}
        <ellipse cx="80" cy="78" rx="27" ry="31" fill="url(#f4Skin)" />
        {/* Beanie Hat */}
        <path d="M50 64 C50 40 110 40 110 64 Z" fill="#A855F7" />
        <rect x="48" y="58" width="64" height="10" rx="4" fill="#9333EA" />
        {/* Eyes */}
        <ellipse cx="68" cy="76" rx="3.5" ry="4.5" fill="#1D281E" />
        <circle cx="67" cy="74.5" r="1.5" fill="#FFF" />
        <ellipse cx="92" cy="76" rx="3.5" ry="4.5" fill="#1D281E" />
        <circle cx="91" cy="74.5" r="1.5" fill="#FFF" />
        {/* Smile */}
        <path d="M74 88 Q80 94 86 88" stroke="#9A3C23" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (id === "female_5") {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" className={`avatar-svg-element ${className}`}>
        <defs>
          <linearGradient id="f5Skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F7DAC8" />
            <stop offset="100%" stopColor="#DEAB93" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="76" fill="#142C1B" stroke="#F43F5E" strokeWidth="3" />
        {/* Top Bun Hair */}
        <circle cx="80" cy="36" r="18" fill="#1E140E" />
        {/* Body */}
        <path d="M42 150 C42 122 65 112 80 112 C95 112 118 122 118 150 Z" fill="#F43F5E" />
        {/* Face */}
        <ellipse cx="80" cy="78" rx="28" ry="32" fill="url(#f5Skin)" />
        {/* Hair Bangs */}
        <path d="M52 68 C58 50 102 50 108 68 C96 54 64 54 52 68 Z" fill="#1E140E" />
        {/* Headphones over ears */}
        <path d="M50 78 C50 42 110 42 110 78" stroke="#FFFFFF" strokeWidth="4" fill="none" />
        <rect x="44" y="68" width="10" height="20" rx="4" fill="#F43F5E" />
        <rect x="106" y="68" width="10" height="20" rx="4" fill="#F43F5E" />
        {/* Eyes */}
        <ellipse cx="68" cy="76" rx="3.5" ry="4.5" fill="#142318" />
        <circle cx="67" cy="74.5" r="1.5" fill="#FFF" />
        <ellipse cx="92" cy="76" rx="3.5" ry="4.5" fill="#142318" />
        <circle cx="91" cy="74.5" r="1.5" fill="#FFF" />
        {/* Smile */}
        <path d="M74 88 Q80 95 86 88" stroke="#9A3C23" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // Male 1
  if (id === "male_1") {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" className={`avatar-svg-element ${className}`}>
        <defs>
          <linearGradient id="m1Skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F9D7C2" />
            <stop offset="100%" stopColor="#E5B59A" />
          </linearGradient>
          <linearGradient id="m1Bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1C4223" />
            <stop offset="100%" stopColor="#0E2112" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="76" fill="url(#m1Bg)" stroke="#4ECC60" strokeWidth="3" />
        {/* Body */}
        <path d="M38 150 C38 118 64 108 80 108 C96 108 122 118 122 150 Z" fill="#255C30" />
        <path d="M68 108 L80 122 L92 108 Z" fill="#F9D7C2" />
        {/* Face */}
        <ellipse cx="80" cy="76" rx="28" ry="32" fill="url(#m1Skin)" />
        {/* Short Athletic Hair & Cap */}
        <path d="M50 62 C50 42 110 42 110 62 Z" fill="#1E2A1F" />
        {/* Cap Visor */}
        <path d="M46 62 Q80 50 114 62" stroke="#4ECC60" strokeWidth="6" strokeLinecap="round" fill="none" />
        {/* Eyes */}
        <ellipse cx="67" cy="74" rx="3.5" ry="4.5" fill="#132115" />
        <circle cx="66" cy="72.5" r="1.5" fill="#FFF" />
        <ellipse cx="93" cy="74" rx="3.5" ry="4.5" fill="#132115" />
        <circle cx="92" cy="72.5" r="1.5" fill="#FFF" />
        {/* Smile */}
        <path d="M72 87 Q80 96 88 87" stroke="#8B3A22" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // Male 2
  if (id === "male_2") {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" className={`avatar-svg-element ${className}`}>
        <defs>
          <linearGradient id="m2Skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F5D0B8" />
            <stop offset="100%" stopColor="#DEA588" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="76" fill="#193622" stroke="#38BDF8" strokeWidth="3" />
        {/* Curly Hair Top */}
        <circle cx="60" cy="50" r="18" fill="#20150E" />
        <circle cx="100" cy="50" r="18" fill="#20150E" />
        <circle cx="80" cy="42" r="20" fill="#20150E" />
        {/* Body */}
        <path d="M38 150 C38 118 64 108 80 108 C96 108 122 118 122 150 Z" fill="#0284C7" />
        {/* Face */}
        <ellipse cx="80" cy="78" rx="28" ry="32" fill="url(#m2Skin)" />
        {/* Glasses */}
        <rect x="58" y="66" width="20" height="16" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
        <rect x="82" y="66" width="20" height="16" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
        <line x1="78" y1="74" x2="82" y2="74" stroke="#FFFFFF" strokeWidth="2.5" />
        {/* Eyes */}
        <circle cx="68" cy="74" r="3" fill="#20150E" />
        <circle cx="92" cy="74" r="3" fill="#20150E" />
        {/* Smile */}
        <path d="M72 88 Q80 96 88 88" stroke="#8B3A22" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // Male 3
  if (id === "male_3") {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" className={`avatar-svg-element ${className}`}>
        <defs>
          <linearGradient id="m3Skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F2CCA6" />
            <stop offset="100%" stopColor="#D99E75" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="76" fill="#152B1B" stroke="#F59E0B" strokeWidth="3" />
        {/* Trimmed Hair */}
        <path d="M52 65 C52 42 108 42 108 65 Z" fill="#261A13" />
        {/* Body */}
        <path d="M38 150 C38 118 64 108 80 108 C96 108 122 118 122 150 Z" fill="#D97706" />
        {/* Face */}
        <ellipse cx="80" cy="76" rx="28" ry="32" fill="url(#m3Skin)" />
        {/* Trimmed Beard around jaw */}
        <path d="M52 80 C52 110 108 110 108 80 C108 104 98 114 80 114 C62 114 52 104 52 80 Z" fill="#261A13" opacity="0.9" />
        {/* Eyes */}
        <ellipse cx="67" cy="72" rx="3.5" ry="4.5" fill="#132115" />
        <circle cx="66" cy="70.5" r="1.5" fill="#FFF" />
        <ellipse cx="93" cy="72" rx="3.5" ry="4.5" fill="#132115" />
        <circle cx="92" cy="70.5" r="1.5" fill="#FFF" />
        {/* Smile */}
        <path d="M72 87 Q80 95 88 87" stroke="#FFFFFF" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // Male 4
  if (id === "male_4") {
    return (
      <svg width={size} height={size} viewBox="0 0 160 160" className={`avatar-svg-element ${className}`}>
        <defs>
          <linearGradient id="m4Skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FCE5D8" />
            <stop offset="100%" stopColor="#E2B7A0" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r="76" fill="#193320" stroke="#10B981" strokeWidth="3" />
        {/* Body */}
        <path d="M38 150 C38 118 64 108 80 108 C96 108 122 118 122 150 Z" fill="#059669" />
        {/* Face */}
        <ellipse cx="80" cy="78" rx="28" ry="32" fill="url(#m4Skin)" />
        {/* Beanie Hat */}
        <path d="M50 62 C50 38 110 38 110 62 Z" fill="#047857" />
        <rect x="48" y="56" width="64" height="10" rx="4" fill="#065F46" />
        {/* Eyes */}
        <ellipse cx="67" cy="74" rx="3.5" ry="4.5" fill="#132115" />
        <circle cx="66" cy="72.5" r="1.5" fill="#FFF" />
        <ellipse cx="93" cy="74" rx="3.5" ry="4.5" fill="#132115" />
        <circle cx="92" cy="72.5" r="1.5" fill="#FFF" />
        {/* Smile */}
        <path d="M72 87 Q80 96 88 87" stroke="#8B3A22" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // Male 5 & Fallback (Male default)
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={`avatar-svg-element ${className}`}>
      <defs>
        <linearGradient id="m5Skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9D7C2" />
          <stop offset="100%" stopColor="#E5B59A" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r="76" fill="#17351F" stroke="#6366F1" strokeWidth="3" />
      {/* Body */}
      <path d="M38 150 C38 118 64 108 80 108 C96 108 122 118 122 150 Z" fill="#4F46E5" />
      {/* Face */}
      <ellipse cx="80" cy="76" rx="28" ry="32" fill="url(#m5Skin)" />
      {/* Hair */}
      <path d="M52 62 C52 40 108 40 108 62 L106 72 C96 56 64 56 54 72 Z" fill="#1F150E" />
      {/* Headphones */}
      <path d="M48 76 C48 38 112 38 112 76" stroke="#FFFFFF" strokeWidth="4" fill="none" />
      <rect x="42" y="66" width="10" height="20" rx="4" fill="#6366F1" />
      <rect x="108" y="66" width="10" height="20" rx="4" fill="#6366F1" />
      {/* Eyes */}
      <ellipse cx="67" cy="74" rx="3.5" ry="4.5" fill="#132115" />
      <circle cx="66" cy="72.5" r="1.5" fill="#FFF" />
      <ellipse cx="93" cy="74" rx="3.5" ry="4.5" fill="#132115" />
      <circle cx="92" cy="72.5" r="1.5" fill="#FFF" />
      {/* Smile */}
      <path d="M72 87 Q80 96 88 87" stroke="#8B3A22" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
