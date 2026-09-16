const arcDegrees = 270
const startDegrees = -arcDegrees / 2

type TickArcProps = {
  count: number
}

export function TickArc({ count }: TickArcProps) {
  const step = count > 1 ? arcDegrees / (count - 1) : 0
  const degrees = Array.from({ length: count }, (_, index) => startDegrees + step * index)

  return (
    <div aria-hidden="true" className="relative h-full w-full">
      {degrees.map((angle, index) => (
        <div key={index} className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
          <span
            data-mark="tick"
            className={`absolute top-0 left-1/2 w-px -translate-x-1/2 rounded-full bg-tick ${
              index % 5 === 0 ? 'h-[5px] opacity-90' : 'h-[3px] opacity-55'
            }`}
          />
        </div>
      ))}
    </div>
  )
}
