import * as THREE from 'three'
import { lines } from './script'

export function distance (x1, x2, y1, y2) {
  const distance = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
  return distance
}

export function findCollisions (id, index) {
  const activeParticleLine = lines.filter(line => line.mesh.uuid === id)

  for (let i = 0; i < lines.length; i++) {
    const particleCount = lines[i].mesh.geometry.attributes.position.count
    const x1 =
      activeParticleLine[0].mesh.geometry.attributes.position.array[index * 3]
    const y1 =
      activeParticleLine[0].mesh.geometry.attributes.position.array[
        index * 3 + 1
      ]

    for (let j = 0; j < particleCount; j++) {
      if (j != index) {
        const x2 = lines[i].mesh.geometry.attributes.position.array[j * 3]
        const y2 = lines[i].mesh.geometry.attributes.position.array[j * 3 + 1]

        const d = distance(x1, x2, y1, y2)

        if (d < activeParticleLine[0].size + activeParticleLine[0].size) {
          activeParticleLine[0].reactToCollision(lines[i], j)
        }
      }
    }
  }
}

const velocity = new THREE.Vector3(0.0)
const position = new THREE.Vector3(0.0)
const acceleration = new THREE.Vector3(0.0)
const gravity = new THREE.Vector3(0.0, -0.0001, 0.0)
const wind = new THREE.Vector3(0.0001, 0.0, 0.0)

const LOWER_BOUNDARY = -0.5
const TOP_BOUNDARY = 0.5
const RIGHT_BOUNDARY = 2.5
const LEFT_BOUNDARY = -2.5

export function moveParticleToStartCollisions (index, particlePositions) {
  position.x = particlePositions.array[index]
  position.y = particlePositions.array[index + 1]
  position.z = particlePositions.array[index + 2]

  applyForce(wind)
  applyForce(gravity)
  velocity.add(acceleration)

  bounceOffEdges()

  position.add(velocity)

  particlePositions.array[index] = position.x
  particlePositions.array[index + 1] = position.y
  particlePositions.needsUpdate = true
}

function bounceOffEdges () {
  if (position.y <= LOWER_BOUNDARY) {
    velocity.multiply(new THREE.Vector3(0.0, -1.0, 0.0))
    return true
  } else if (position.y >= TOP_BOUNDARY) {
    velocity.multiply(new THREE.Vector3(0.0, 1.0, 0.0))
    return true
  } else if (position.x <= LEFT_BOUNDARY) {
    velocity.multiply(new THREE.Vector3(1.0, 0.0, 0.0))
    return true
  } else if (position.x >= RIGHT_BOUNDARY) {
    velocity.multiply(new THREE.Vector3(-1.0, 0.0, 0.0))
    return true
  }
  return false
}

function applyForce (force) {
  acceleration.add(force)
}
