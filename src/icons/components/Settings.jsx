/**
 * Settings Icon Component
 */

function Settings({ 
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
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0-2.05 1.03l-.87 2.54-.99-1.26a1.65 1.65 0 0 0-1.99-.57l-.87.27a1.65 1.65 0 0 0-.87 1.59v.11c0 1.1.87 2 1.95 2.05l.87.17a1.65 1.65 0 0 0 2.05-1.03l.73-2.14a1.65 1.65 0 0 1 1.99-.57l.87.27a1.65 1.65 0 0 0 1.59-.87h.07a1.65 1.65 0 0 0 .57-.99l.22-.83c.28-.562.735-.562 1.012 0M12 8v4M12 8H8v8h8V8z" />
    </svg>
  )
}

export default Settings