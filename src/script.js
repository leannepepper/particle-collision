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
let intersections = []
const lines = []
let initialMouse = new THREE.Vector3()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
export const scene = new THREE.Scene()

// Create Lines
for (let i = 0; i < 2; i++) {
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

  //on mouseup release line and animate and clear initial mouse
}

function onMouseDown (event) {
  raycaster.setFromCamera(mouse, camera)

  intersections = raycaster.intersectObjects(
    lines.map(line => line.mesh),
    false
  )

  if (intersections.length > 0) {
    controls.enabled = false
    isMoving = true
    initialMouse.copy(mouse)
  }
}

function onMouseMove (event) {
  mouse.x = (event.clientX / sizes.width) * 2 - 1
  mouse.y = -(event.clientY / sizes.height) * 2 + 1

  if (isMoving) {
    // Reduce the intersections down to include one unique
    // TODO: refactor to use reduce
    let uniqueLines = []
    const array1 = []
    for (let i = 0; i < intersections.length; i++) {
      if (i === 0) {
        array1.push(intersections[i])
      } else {
        const array2 = []
        array1.forEach(item => {
          if (item.object.uuid !== intersections[i].object.uuid) {
            array2.push(intersections[i])
          }
        })
        uniqueLines = array1.concat(array2)
      }
    }

    moveLineParticles(uniqueLines)
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

function moveLineParticles (uniqueLines) {
  // for each line take that particle and move it down by the mouse delta.
  uniqueLines.forEach(line => {
    const i3 = line.index * 3
    const mouseDelta =
      Math.abs(line.point.y) -
      Math.abs(line.object.geometry.attributes.position.array[i3 + 1])

    console.log(
      line.point.y,
      line.object.geometry.attributes.position.array[i3 + 1],
      mouseDelta
    )
    // Change the initial point
    line.object.geometry.attributes.position.array[i3 + 1] = line.point.y

    line.object.geometry.attributes.position.needsUpdate = true

    dragParticleLine(line, mouseDelta)
  })
}

function dragParticleLine (line, delta) {
  // the larger the delta, then larger the radius to move

  const disruptRadius = randomIntFromInterval(5, 5)
  const lineCount = line.object.geometry.attributes.position.array.length / 3

  for (let i = 0; i < disruptRadius; i++) {
    const rightSideEffectParticleIndex = (line.index + i) * 3
    const leftSideEffectParticleIndex = (line.index - i) * 3

    line.object.geometry.attributes.position.array[
      rightSideEffectParticleIndex + 1
    ] = line.point.y

    line.object.geometry.attributes.position.array[
      leftSideEffectParticleIndex + 1
    ] = line.point.y
  }

  line.object.geometry.attributes.position.needsUpdate = true
}

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
