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

  // Method
  //   calcArea () {
  //     return this.height * this.width
  //   }

  createParticleLine = () => {
    var positions = new Float32Array(this.count * 3)

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3
      positions[i3] = i
      positions[i3 + 1] = Math.sin(i * 0.2) * 2.0
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

    return particles
  }
}
