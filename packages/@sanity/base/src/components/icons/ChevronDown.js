import React from 'react'

const strokeStyle = {
  stroke: 'currentColor',
  strokeWidth: 1.2,
  vectorEffect: 'non-scaling-stroke'
}

export default function ChevronDown() {
  return (
    <svg
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
      width="1em"
      height="1em"
    >
      <path d="M17 10L12.5 15.5L8 10" style={strokeStyle} />
    </svg>
  )
}
