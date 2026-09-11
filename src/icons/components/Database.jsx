/**
 * Database Icon Component
 */

function Database({ 
  size = 24, 
  color = '#08060d', 
  className = '',
  strokeWidth = 1.5,
  ...props 
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M2 12.614v6.386A2 2 0 0 0 4 21h16a2 2 0 0 0 2-2V5.386" />
      <path d="M10 15v-6" />
      <path d="M14 15v-6" />
      <path d="M10 9v6" />
      <path d="M14 9v6" />
    </svg>
  )
}

export default Database