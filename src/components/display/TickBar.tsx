type TickBarProps = {
  count: number
}

export function TickBar({ count }: TickBarProps) {
  const marks = Array.from({ length: count }, (_, index) => index)

  return (
    <div aria-hidden="true" className="flex h-full w-full items-start justify-between">
      {marks.map((index) => (
        <span
          key={index}
          data-mark="tick"
          className={`w-px rounded-full bg-tick ${
            index % 5 === 0 ? 'h-full opacity-90' : 'h-1/2 opacity-50'
          }`}
        />
      ))}
    </div>
  )
}
