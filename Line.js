import * as THREE from 'three'
import { scene } from './script'
import { distance, findCollisionSide } from './collision'

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/particle.png')

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

  reactToCollision = (line, index, r1, r2) => {
    const collisionSide = findCollisionSide(r1, r2)
    const position = new THREE.Vector3(
      line.mesh.geometry.attributes.position.array[index * 3],
      line.mesh.geometry.attributes.position.array[index * 3 + 1],
      line.mesh.geometry.attributes.position.array[index * 3 + 2]
    )

    switch (collisionSide) {
      case 'none':
        break
      case 'left':
        position.add(new THREE.Vector3(0.05, 0.0, 0.0))
        break

      case 'right':
        position.add(new THREE.Vector3(-0.05, 0.0, 0.0))
        break

      case 'top':
        position.add(new THREE.Vector3(0.0, 0.05, 0.0))
        break

      case 'bottom':
        position.add(new THREE.Vector3(0.0, -0.05, 0.0))
        break

      default:
        break
    }

    line.mesh.geometry.attributes.position.array[index * 3] = position.x
    line.mesh.geometry.attributes.position.array[index * 3 + 1] = position.y

    line.mesh.geometry.attributes.position.needsUpdate = true
  }
}
