/**
 * Cloud Icon Component
 */

function Cloud({ 
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
      <path d="M20 16.58A5 5 0 0 1 12.5 20c-2.76 0-5.24-1.61-6.42-4.42a5.5 5.5 0 1 1 10.84-1.84c.72.39 1.33.94 1.85 1.62A5.48 5.48 0 0 1 20 16.58z" />
    </svg>
  )
}

export default Cloud