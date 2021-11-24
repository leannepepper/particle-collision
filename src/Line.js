import * as THREE from 'three'
import { scene } from './script'
import { distance } from './collision'

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particle.png')

export class Line {
  constructor () {
    this.mesh = null
    this.size = null
  }

  createParticleLine = (count, size, color, position, waveVariables) => {
    const particleGeometry = new THREE.BufferGeometry()
    count = Math.abs(count)
    const spread = waveVariables.spread
    const amplitude = waveVariables.amplitude
    const frequency = waveVariables.frequency
    this.size = size

    const positions = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = i3 * 0.02 * spread
      positions[i3 + 1] =
        Math.cos(i * frequency) * amplitude + (0.5 - positions[i3] * 0.25) // as x increases y decreases
      positions[i3 + 2] = 0
    }

    particleGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )

    const particleMaterial = new THREE.PointsMaterial({
      color: color,
      size: size,
      sizeAttenuation: true
    })

    particleMaterial.map = particleTexture
    particleMaterial.depthWrite = false
    particleMaterial.blending = THREE.AdditiveBlending

    const particles = new THREE.Points(particleGeometry, particleMaterial)

    particles.position.x = position.x
    particles.position.y = position.y

    this.mesh = particles

    scene.add(particles)
  }

  checkForCollision = (particleIndex1, lineToCheckObj) => {
    const { lineToCheck, particleIndex2 } = lineToCheckObj

    // TODO: check collisions in 3D space
    const x1 = this.mesh.geometry.attributes.position.array[particleIndex1 * 3]
    const y1 = this.mesh.geometry.attributes.position.array[
      particleIndex1 * 3 + 1
    ]

    const x2 =
      lineToCheck.mesh.geometry.attributes.position.array[particleIndex2 * 3]
    let y2 =
      lineToCheck.mesh.geometry.attributes.position.array[
        particleIndex2 * 3 + 1
      ]

    const d = distance(x1, x2, y1, y2)

    if (d < this.size + this.size) {
      //physics to react to collision
      lineToCheck.mesh.geometry.attributes.position.array[
        particleIndex2 * 3 + 1
      ] += 0.5
      lineToCheck.mesh.geometry.attributes.position.needsUpdate = true
    }
  }
}
