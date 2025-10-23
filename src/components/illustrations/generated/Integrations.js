import * as React from "react";
const SvgIntegrations = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 240 120"
    width="1em"
    height="1em"
    {...props}
  >
    <rect width={240} height={120} rx={12} fill="#fff" stroke="#f0f8ff" />
    <g fill="#f8fbff" transform="translate(12 12)">
      <rect width={70} height={40} rx={6} />
      <rect x={82} width={70} height={40} rx={6} />
      <rect x={164} width={64} height={40} rx={6} />
    </g>
  </svg>
);
export default SvgIntegrations;
