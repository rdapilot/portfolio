/**
 * Download Icon Component
 */

function Download({ 
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l3 3 3-3M12 19v-9" />
    </svg>
  )
}

export default Download