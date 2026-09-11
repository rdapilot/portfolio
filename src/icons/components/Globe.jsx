/**
 * Globe Icon Component
 */

function Globe({ 
  size = 24, 
  color = '#08060d', 
  className = '',
  strokeWidth = 1.35,
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
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M4.93 4.93l14.14 14.14M2 12c5.523 0 10-4.477 10-10v2c-4.411 0-8 3.589-8 8H2z" />
    </svg>
  )
}

export default Globe