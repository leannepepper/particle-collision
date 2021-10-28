import * as THREE from 'three'

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particle.png')

/**
 * Geometry
 */
const particleGeometry = new THREE.BufferGeometry()

export class Line {
  constructor (count, size, color, mesh, position) {
    this.count = count
    this.size = size
    this.color = color
    this.mesh = mesh
    this.position = position
  }

  createParticleLine = () => {
    const spread = 2.5
    const amplitude = 0.2
    const frequency = 0.3

    var positions = new Float32Array(this.count * 3)

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3
      positions[i3] = i * spread * 0.04
      positions[i3 + 1] =
        Math.cos(i * frequency) * amplitude + (0.5 - positions[i3] * 0.3)
      positions[i3 + 2] = 0
    }

    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )

    const particleMaterial = new THREE.PointsMaterial({
      color: this.color,
      size: this.size,
      sizeAttenuation: true
    })

    particleMaterial.map = particleTexture
    particleMaterial.depthWrite = false
    particleMaterial.blending = THREE.AdditiveBlending

    const particles = new THREE.Points(particleGeometry, particleMaterial)
    particles.position.x = this.position.x
    particles.position.y = this.position.y

    this.mesh = particles
    return particles
  }
}
