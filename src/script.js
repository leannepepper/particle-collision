import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import CANNON from 'cannon'
import SimplexNoise from 'simplex-noise'
import { Line } from './Line'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const threshold = 0.02
const noise = new SimplexNoise('seed')
let intersection = null
const lines = []

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
export const scene = new THREE.Scene()
const animatingParticles = []

for (let i = 0; i < 10; i++) {
  const noiseValue = Math.abs(noise.noise3D(i, i * 1.6, 5.5))
  const count = Math.round(45 / noiseValue)
  const particleLine = new Line()

  particleLine.createParticleLine(
    count,
    0.06 * noiseValue,
    0xffff00,
    new THREE.Vector3(-1.3, 0, 0),
    {
      spread: noiseValue,
      amplitude: noiseValue,
      frequency: 0.3 * noiseValue
    }
  )

  lines.push(particleLine)
}

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

camera.position.z = 1

scene.add(camera)

/**
 * Raycaster
 */

const raycaster = new THREE.Raycaster()
raycaster.params.Points.threshold = threshold

let mouse = new THREE.Vector3(0, 0, 0)

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

let isMoving = false

function onMouseUp (event) {
  isMoving = false
  // controls.enabled = true

  //on mouseup release line and animate
}

function onMouseDown (event) {
  raycaster.setFromCamera(mouse, camera)

  const intersections = raycaster.intersectObjects(
    lines.map(line => line.mesh),
    false
  )
  intersection = intersections.length > 0 ? intersections[0] : null // Might need to change this for multiple lines
  console.log(intersections)

  if (intersection) {
    controls.enabled = false
    isMoving = true
  }
}

function onMouseMove (event) {
  mouse.x = (event.clientX / sizes.width) * 2 - 1
  mouse.y = -(event.clientY / sizes.height) * 2 + 1
  // mouse.z = 0

  // // convert screen coordinates to threejs world position
  // // https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z

  // var vector = new THREE.Vector3(mouse.x, mouse.y, 0)
  // vector.unproject(camera)
  // var dir = vector.sub(camera.position).normalize()
  // var distance = -camera.position.z / dir.z
  // var pos = camera.position.clone().add(dir.multiplyScalar(distance))

  // mouse = pos

  if (isMoving) {
    moveLineParticles()
  }
}

window.addEventListener('mousemove', onMouseMove)
window.addEventListener('mousedown', onMouseDown)
window.addEventListener('mouseup', onMouseUp)

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

function moveLineParticles () {
  const i3 = intersection.index * 3

  intersection.object.geometry.attributes.position.array[i3 + 1] = mouse.y
  intersection.object.geometry.attributes.position.needsUpdate = true
}

// function animateLineParticles (line, elapsedTime) {
//   const count = 50 // temp constant
//   // const intersections = raycaster.intersectObjects([line], false)
//   // intersection = intersections.length > 0 ? intersections[0] : null
//   // Find Particles that should animate

//   if (intersection) {
//     const i3 = intersection.index * 3
//     animatingParticles.push({
//       index: intersection.index,
//       yInitalValue:
//         intersection.object.geometry.attributes.position.array[i3 + 1]
//     })

//     const disruptRadius = randomIntFromInterval(1, 5)

//     for (let i = 0; i < disruptRadius; i++) {
//       const rightSideEffectParticleIndex = (intersection.index + i) * 3
//       if (rightSideEffectParticleIndex <= count) {
//         const rightSideParticle = {
//           index: intersection.index + i,
//           yInitalValue:
//             intersection.object.geometry.attributes.position.array[
//               rightSideEffectParticleIndex + 1
//             ]
//         }
//         animatingParticles.push(rightSideParticle)
//       }

//       const leftSideEffectParticleIndex = (intersection.index - i) * 3
//       if (leftSideEffectParticleIndex >= 0) {
//         const leftSideParticle = {
//           index: intersection.index - i,
//           yInitalValue:
//             intersection.object.geometry.attributes.position.array[
//               leftSideEffectParticleIndex + 1
//             ]
//         }
//         animatingParticles.push(leftSideParticle)
//       }
//     }
//   }

//   // Animate Particles
//   if (!intersection) return
//   for (let i = 0; i < animatingParticles.length; i++) {
//     const index = animatingParticles[i].index
//     const i3 = index * 3

//     const x = intersection.object.geometry.attributes.position.array[i3]
//     const animateYValue = Math.sin(elapsedTime + x + count * 0.2) * 4.0
//     intersection.object.geometry.attributes.position.array[
//       i3 + 1
//     ] = animateYValue

//     intersection.object.geometry.attributes.position.needsUpdate = true

//     const initalTestValue = parseFloat(
//       animatingParticles[i].yInitalValue.toFixed(1)
//     )

//     const animatingTestValue = parseFloat(animateYValue.toFixed(1))

//     if (initalTestValue === animatingTestValue) {
//       intersection.object.geometry.attributes.position.array[i3 + 1] =
//         animatingParticles[i].yInitalValue
//       intersection.object.geometry.attributes.position.needsUpdate = true

//       animatingParticles.splice(i, 1)
//     }
//   }
// }

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

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
