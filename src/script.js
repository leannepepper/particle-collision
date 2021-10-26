import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import CANNON from 'cannon'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const threshold = 0.1
let intersection = null
const lines = []

const line1 = {
  count: 50,
  size: 0.5,
  color: 0xff00ff,
  mesh: null,
  position: new THREE.Vector3(-20, 0, 0)
}

const line2 = {
  count: 50,
  size: 0.2,
  color: 0xffff00,
  mesh: null,
  position: new THREE.Vector3(-30, 0, 0)
}

const line3 = {
  count: 50,
  size: 0.2,
  color: 0x00ffff,
  mesh: null,
  position: new THREE.Vector3(-25, 1, 0)
}

lines.push(line1, line2, line3)

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const animatingParticles = []

/**
 * Geometry
 */
const particleGeometry = new THREE.BufferGeometry()

const createParticleLine = (count, size, color) => {
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
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
    color,
    size
  })

  const particles = new THREE.Points(particleGeometry, particleMaterial)
  return particles
}

lines.forEach(line => {
  const particles = createParticleLine(line.count, line.size, line.color)
  particles.position.x = line.position.x
  particles.position.y = line.position.y

  // add mesh to line obj
  line.mesh = particles
  scene.add(particles)
})

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  2000
)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 40

scene.add(camera)

/**
 * Raycaster
 */

const raycaster = new THREE.Raycaster()
raycaster.params.Points.threshold = threshold

let mouse = new THREE.Vector2(0, 0)

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

function onMouseMove (event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
}

window.addEventListener('mousemove', onMouseMove)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

function animateLineParticles (line, elapsedTime) {
  const intersections = raycaster.intersectObjects([line.mesh], false)
  intersection = intersections.length > 0 ? intersections[0] : null

  // Find Particles that should animate
  if (intersection) {
    const i3 = intersection.index * 3
    animatingParticles.push({
      index: intersection.index,
      yInitalValue: particleGeometry.attributes.position.array[i3 + 1]
    })

    const disruptRadius = randomIntFromInterval(1, 5)

    for (let i = 0; i < disruptRadius; i++) {
      const rightSideEffectParticleIndex = (intersection.index + i) * 3
      if (rightSideEffectParticleIndex <= line.count) {
        const rightSideParticle = {
          index: intersection.index + i,
          yInitalValue:
            particleGeometry.attributes.position.array[
              rightSideEffectParticleIndex + 1
            ]
        }
        animatingParticles.push(rightSideParticle)
      }

      const leftSideEffectParticleIndex = (intersection.index - i) * 3
      if (leftSideEffectParticleIndex >= 0) {
        const leftSideParticle = {
          index: intersection.index - i,
          yInitalValue:
            particleGeometry.attributes.position.array[
              leftSideEffectParticleIndex + 1
            ]
        }
        animatingParticles.push(leftSideParticle)
      }
    }
  }

  // Animate Particles
  for (let i = 0; i < animatingParticles.length; i++) {
    const index = animatingParticles[i].index
    const i3 = index * 3

    const x = particleGeometry.attributes.position.array[i3]
    const animateYValue = Math.sin(elapsedTime + x + line.count * 0.2) * 4.0
    particleGeometry.attributes.position.array[i3 + 1] = animateYValue

    particleGeometry.attributes.position.needsUpdate = true

    const initalTestValue = parseFloat(
      animatingParticles[i].yInitalValue.toFixed(1)
    )
    const animatingTestValue = parseFloat(animateYValue.toFixed(1))

    if (initalTestValue === animatingTestValue) {
      particleGeometry.attributes.position.array[i3 + 1] =
        animatingParticles[i].yInitalValue
      particleGeometry.attributes.position.needsUpdate = true

      animatingParticles.splice(i, 1)
    }
  }
}

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  raycaster.setFromCamera(mouse, camera)

  lines.forEach(line => animateLineParticles(line, elapsedTime))

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()

/* Utils */

function randomIntFromInterval (min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}
