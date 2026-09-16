type GlyphProps = {
  name: 'speaker'
}

export function Glyph({ name }: GlyphProps) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="engraved h-7 w-7 shrink-0">
      {name === 'speaker' && (
        <>
          <path d="M4 9v6h3.2l4.8 3.6V5.4L7.2 9H4z" fill="currentColor" />
          <path
            d="M15.5 8.5a5 5 0 0 1 0 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M18 6a8.5 8.5 0 0 1 0 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  )
}
