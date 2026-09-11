/**
 * Heart Icon Component
 */

function Heart({ 
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
      <path d="M20.84 5.61A5.5 5.5 0 0 1 12 3.5a5.5 5.5 0 0 1-8.84 2.11c.85 1.14 2.17 1.78 3.5 1.78A5.5 5.5 0 0 1 12 9.5c3.18 0 5.5 2.42 5.5 5.5 0 3.78-3.4 6.86-8.05 11.54L12 21.35z" />
    </svg>
  )
}

export default Heart