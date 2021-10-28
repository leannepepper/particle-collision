import * as THREE from 'three'
import { scene } from './script'

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particle.png')

export const createParticleLine = (
  count,
  size,
  color,
  mesh,
  position,
  waveVariables
) => {
  const particleGeometry = new THREE.BufferGeometry()

  const spread = waveVariables.spread
  const amplitude = waveVariables.amplitude
  const frequency = waveVariables.frequency

  var positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3] = i * spread * 0.04
    positions[i3 + 1] =
      Math.cos(i * frequency) * amplitude + (0.5 - positions[i3] * 0.3) // as x increases y decreases
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

  mesh = particles
  scene.add(particles)
  return particles
}
