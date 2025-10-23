import * as React from "react";
const SvgHero = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 120"
    width="1em"
    height="1em"
    {...props}
  >
    <defs>
      <linearGradient id="hero_svg__a" x1={0} x2={1}>
        <stop offset={0} stopColor="#fbe7ff" />
        <stop offset={1} stopColor="#e7f5ff" />
      </linearGradient>
    </defs>
    <rect width={200} height={120} rx={10} fill="url(#hero_svg__a)" />
    <circle cx={40} cy={40} r={18} fill="#fff" opacity={0.6} />
    <rect
      x={70}
      y={20}
      width={100}
      height={70}
      rx={6}
      fill="#fff"
      opacity={0.85}
    />
  </svg>
);
export default SvgHero;
