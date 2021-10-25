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

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const animatingParticles = []

/**
 * Physics
 */
// const world = new CANNON.World()
// world.gravity.set(0, -9.82, 0)

// const particleShape = new CANNON.Particle()

// const particleBody = new CANNON.Body({
//   mass: 0,
//   position: new CANNON.Vec3(1, 0, 0),
//   shape: particleShape
// })

// world.addBody(particleBody)

/**
 * Geometry
 */
const particleGeometry = new THREE.BufferGeometry()
const count = 50

const positions = new Float32Array(count * 3)

for (let i = 0; i < count; i++) {
  const i3 = i * 3
  positions[i3] = i
  positions[i3 + 1] = 0
  positions[i3 + 2] = 0
}

particleGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
)

/**
 * Material
 */
const particleMaterial = new THREE.PointsMaterial({
  size: 1.0,
  sizeAttenuation: true,
  color: 0xff00ff
})

/**
 * Particles
 */
const particles = new THREE.Points(particleGeometry, particleMaterial)
scene.add(particles)

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
  100
)

camera.position.z = 40
scene.add(camera)

/**
 * Raycaster
 */

const raycaster = new THREE.Raycaster()
raycaster.params.Points.threshold = threshold

const mouse = new THREE.Vector2()

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

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  raycaster.setFromCamera(mouse, camera)

  // Update Particles
  const intersections = raycaster.intersectObjects([particles], false)
  intersection = intersections.length > 0 ? intersections[0] : null

  if (intersection) {
    const i3 = intersection.index * 3
    animatingParticles.push({
      index: intersection.index,
      yInitalValue: particleGeometry.attributes.position.array[i3 + 1]
    })

    const disruptRadius = randomIntFromInterval(1, 5)

    for (let i = 0; i < disruptRadius; i++) {
      const rightSideEffectParticleIndex = (intersection.index + i) * 3
      const leftSideEffectParticleIndex = (intersection.index - i) * 3

      const rightSideParticle = {
        index: intersection.index + i,
        yInitalValue:
          particleGeometry.attributes.position.array[
            rightSideEffectParticleIndex + 1
          ]
      }
      const leftSideParticle = {
        index: intersection.index - i,
        yInitalValue:
          particleGeometry.attributes.position.array[
            leftSideEffectParticleIndex + 1
          ]
      }

      animatingParticles.push(rightSideParticle, leftSideParticle)
    }
  }

  for (let i = 0; i < animatingParticles.length; i++) {
    const index = animatingParticles[i].index
    const i3 = index * 3

    const x = particleGeometry.attributes.position.array[i3]
    const animateYValue = Math.cos(elapsedTime + x * 0.2)
    particleGeometry.attributes.position.array[i3 + 1] = animateYValue

    particleGeometry.attributes.position.needsUpdate = true

    if (parseFloat(animateYValue.toFixed(1)) === 0) {
      particleGeometry.attributes.position.array[i3 + 1] = 0 // set back to initial value
      particleGeometry.attributes.position.needsUpdate = true

      animatingParticles.splice(i, 1)
    }
  }

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
