"use client";

type LogoProps = {
  className?: string;
  size?: number;
};

export function Logo({ className, size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Heart background shape */}
      <path
        d="M100 180 C42 140 10 105 10 70 C10 42 32 20 58 20 C74 20 88 30 100 46 C112 30 126 20 142 20 C168 20 190 42 190 70 C190 105 158 140 100 180Z"
        fill="#FDFBF7"
        stroke="#1B3A5C"
        strokeWidth="3"
      />

      {/* Venezuela map silhouette (stylized) inside heart */}
      <path
        d="M100 50 C80 50 65 58 58 70 C52 80 50 90 55 98 C58 102 62 100 65 96 C68 92 70 85 75 82 C80 79 85 80 88 84 C90 87 92 92 95 94 C98 96 102 96 105 94 C108 92 110 87 112 84 C115 80 120 79 125 82 C130 85 132 92 135 96 C138 100 142 102 145 98 C150 90 148 80 142 70 C135 58 120 50 100 50Z"
        fill="#1B3A5C"
        opacity="0.15"
      />

      {/* Left hand */}
      <g>
        <path
          d="M72 95 C68 90 60 88 55 92 C50 96 50 104 54 108 C58 112 66 112 72 110 C76 108 78 104 78 100"
          stroke="#E8A838"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M55 92 C50 88 44 90 42 95 C40 100 42 106 46 108"
          stroke="#E8A838"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Right hand */}
      <g>
        <path
          d="M128 95 C132 90 140 88 145 92 C150 96 150 104 146 108 C142 112 134 112 128 110 C124 108 122 104 122 100"
          stroke="#E8A838"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M145 92 C150 88 156 90 158 95 C160 100 158 106 154 108"
          stroke="#E8A838"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Clasped hands center - the handshake */}
      <path
        d="M88 100 C90 104 94 106 100 106 C106 106 110 104 112 100"
        stroke="#C94C3E"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M92 103 C94 108 97 110 100 110 C103 110 106 108 108 103"
        stroke="#C94C3E"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Gold accent dots */}
      <circle cx="100" cy="48" r="3" fill="#E8A838" />
      <circle cx="82" cy="54" r="2" fill="#E8A838" opacity="0.6" />
      <circle cx="118" cy="54" r="2" fill="#E8A838" opacity="0.6" />
    </svg>
  );
}

type LogotypeProps = {
  className?: string;
  size?: number;
  showTagline?: boolean;
};

export function Logotype({ className, size = 40, showTagline = false }: LogotypeProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Logo size={size} />
      <span className="flex flex-col">
        <span className="font-heading text-base font-semibold leading-tight text-primary">
          Venezuela Te Ayuda
        </span>
        {showTagline && (
          <span className="text-xs font-medium text-accent">Mapa de ayuda mutua</span>
        )}
      </span>
    </span>
  );
}
