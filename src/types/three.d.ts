declare module 'three' {
  export class Vector2 {
    constructor(x?: number, y?: number)
    x: number
    y: number
  }

  export class Vector3 {
    constructor(x?: number, y?: number, z?: number)
    x: number
    y: number
    z: number
  }

  export class Euler {
    constructor(x?: number, y?: number, z?: number)
    x: number
    y: number
    z: number
  }

  export class Matrix4 {
    constructor()
  }

  export class Quaternion {
    constructor(x?: number, y?: number, z?: number, w?: number)
  }

  export class Color {
    constructor(value?: string | number)
    setHex(hex: number): this
  }

  export class Scene {
    constructor()
    add(object: Object3D): this
    remove(object: Object3D): this
    children: Object3D[]
    background?: Color | null
  }

  export class Camera extends Object3D {
    constructor()
  }

  export class PerspectiveCamera extends Camera {
    constructor(fov?: number, aspect?: number, near?: number, far?: number)
    fov: number
    aspect: number
    near: number
    far: number
    position: Vector3
    updateProjectionMatrix(): void
  }

  export class Object3D {
    constructor()
    position: Vector3
    rotation: Euler
    scale: Vector3
    children: Object3D[]
    parent?: Object3D
    add(object: Object3D): this
    remove(object: Object3D): this
  }

  export class Geometry {
    constructor()
    attributes: Record<string, unknown>
  }

  export class BufferGeometry {
    constructor()
    setAttribute(name: string, attribute: BufferAttribute): this
    attributes: Record<string, BufferAttribute>
  }

  export class BufferAttribute {
    constructor(array: BufferSource, itemSize: number, normalized?: boolean)
    array: BufferSource
    itemSize: number
    normalized: boolean
    needsUpdate: boolean
  }

  export class Material {
    constructor()
    color?: Color
    transparent?: boolean
    opacity?: number
    side?: number
  }

  export class LineBasicMaterial extends Material {
    constructor(parameters?: Record<string, unknown>)
    color: Color
    linewidth?: number
    transparent?: boolean
    opacity?: number
  }

  export class PointMaterial extends Material {
    constructor(parameters?: Record<string, unknown>)
    size: number
    sizeAttenuation?: boolean
    color: Color
    transparent?: boolean
    opacity?: number
  }

  export class PointsMaterial extends Material {
    constructor(parameters?: Record<string, unknown>)
    size: number
    sizeAttenuation?: boolean
    color: Color
    transparent?: boolean
    opacity?: number
  }

  export class Mesh extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material)
    geometry: BufferGeometry
    material: Material
    rotation: Euler
  }

  export class Points extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material)
    geometry: BufferGeometry
    material: Material
    rotation: Euler
  }

  export class LineSegments extends Object3D {
    constructor(geometry?: BufferGeometry, material?: Material)
    geometry: BufferGeometry
    material: Material
    rotation: Euler
  }

  export class WebGLRenderer {
    constructor(parameters?: Record<string, unknown>)
    setSize(width: number, height: number): void
    render(scene: Scene, camera: Camera): void
    setClearColor(color: number, alpha?: number): void
    dispose(): void
    setPixelRatio(value: number): void
    domElement: HTMLCanvasElement
    outputEncoding?: number
  }

  export const scene: Scene
  export const camera: Camera
  export const renderer: WebGLRenderer

  export const BufferSource: unknown
}
