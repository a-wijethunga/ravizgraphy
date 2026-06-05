declare module 'anime' {
  interface AnimeInstance {
    pause(): void
    play(): void
    restart(): void
    reverse(): void
    seek(value: number): void
    set(value: unknown): void
  }

  interface AnimeParams {
    targets?: unknown
    duration?: number
    delay?: number | ((el: unknown, i: number) => number)
    endDelay?: number
    easing?: string | ((t: number) => number)
    round?: boolean | number
    elasticity?: number
    direction?: string
    loop?: boolean | number
    autoplay?: boolean
    opacity?: number | number[] | string | string[]
    scale?: number | number[] | string | string[]
    translateX?: number | number[] | string | string[]
    translateY?: number | number[] | string | string[]
    rotateX?: number | number[]
    rotateY?: number | number[]
    rotateZ?: number | number[]
    rotate?: number | number[]
    skewX?: number | number[]
    skewY?: number | number[]
    scaleX?: number | number[]
    scaleY?: number | number[]
    x?: number | number[] | string | string[]
    y?: number | number[] | string | string[]
    z?: number | number[]
    width?: number | number[] | string | string[]
    height?: number | number[] | string | string[]
    left?: number | number[] | string | string[]
    top?: number | number[] | string | string[]
    backgroundColor?: string | string[]
    color?: string | string[]
    boxShadow?: string | string[]
    filter?: string | string[]
    [key: string]: unknown
  }

  interface AnimeTimelineParams {
    autoplay?: boolean
  }

  class AnimeTimeline {
    add(params: AnimeParams, offset?: string | number): AnimeTimeline
    pause(): void
    play(): void
    restart(): void
    reverse(): void
    seek(value: number): void
    set(value: unknown): void
  }

  function anime(params: AnimeParams): AnimeInstance

  namespace anime {
    function timeline(params?: AnimeTimelineParams): AnimeTimeline
    function set(targets: unknown, params: AnimeParams): AnimeInstance
    function stagger(value: number | number[] | string | ((index: number) => number), params?: unknown): number | number[] | ((index: number) => number)
    function quickSetter(targets: unknown, property: string, unit?: string): (value: unknown) => void
    function random(min: number, max: number): number
    const easings: Record<string, (t: number) => number>
  }

  export default anime
}

