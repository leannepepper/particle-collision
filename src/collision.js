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
          const r1 = {
            x: x1,
            y: y1,
            w: activeParticleLine[0].size,
            h: activeParticleLine[0].size
          }
          const r2 = {
            x: x2,
            y: y2,
            w: lines[i].size,
            h: lines[i].size
          }

          activeParticleLine[0].reactToCollision(lines[i], j, r1, r2)
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

export function findCollisionSide (r1, r2) {
  // https://stackoverflow.com/questions/29861096/detect-which-side-of-a-rectangle-is-colliding-with-another-rectangle

  const dx = r1.x + r1.w / 2 - (r2.x + r2.w / 2)
  const dy = r1.y + r1.h / 2 - (r2.y + r2.h / 2)
  const width = (r1.w + r2.w) / 2
  const height = (r1.h + r2.h) / 2
  const crossWidth = width * dy
  const crossHeight = height * dx
  let collision = 'none'

  if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
    if (crossWidth > crossHeight) {
      collision = crossWidth > -crossHeight ? 'bottom' : 'left'
    } else {
      collision = crossWidth > -crossHeight ? 'right' : 'top'
    }
  }
  return collision
}
