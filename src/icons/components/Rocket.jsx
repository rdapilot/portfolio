/**
 * Rocket Icon Component - stroke-based matching documentation-icon style
 */

function Rocket({ 
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
      <path d="M2 2l20 20-4-4-6 6-8-8 4-4-6 6-8-8 10 10zM12 2a5 5 0 0 1 5 5v2a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V7a5 5 0 0 1 5-5z" />
    </svg>
  )
}

export default Rocket