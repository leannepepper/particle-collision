import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import SimplexNoise from 'simplex-noise'
import { Line } from './Line'
import { findCollisions, moveParticleToStartCollisions } from './collision'

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()
const noise = new SimplexNoise('seed')
const movingParticles = []
const threshold = 0.02
const canvas = document.querySelector('canvas.webgl')
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const raycaster = new THREE.Raycaster()
raycaster.params.Points.threshold = threshold

let intersections = []
let dragging = false
let animateParticles = false

export const lines = []
export const mouse = new THREE.Vector3()
export const scene = new THREE.Scene()

// Add debug box

const box = new THREE.Mesh(
  new THREE.BoxBufferGeometry(3.0, 1.5, 1),
  new THREE.MeshBasicMaterial({ color: 'red', wireframe: true })
)
box.position.y = 0.2
// box.position.x = 0.5

// scene.add(box)

const particleParams = {
  size: 0.15,
  count: 10
}

// Create Lines
for (let i = 0; i < particleParams.count; i++) {
  const noiseValue = Math.abs(noise.noise3D(i, i * 1.6, 5.5))
  const count = Math.round(45 / noiseValue)
  const particleLine = new Line()

  particleLine.createParticleLine(
    count,
    particleParams.size * noiseValue,
    new THREE.Color(noiseValue / i + 5, noiseValue / i + 1, 10 / i),
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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  60,
  sizes.width / sizes.height,
  0.1,
  200
)

camera.position.z = 2
camera.lookAt(scene.position)

scene.add(camera)

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

function onMouseUp (event) {
  if (dragging) {
    animateParticles = true
    dragging = false
  }
}

function onMouseDown (event) {
  // Set Raycaster
  setMousePosition(event)
  raycaster.setFromCamera(mouse, camera)

  // Get Index
  intersections = raycaster.intersectObjects(lines.map(line => line.mesh))
  if (intersections.length > 0) {
    dragging = true
  }
}

function onMouseMove (event) {
  event.preventDefault()
  setMousePosition(event)

  if (dragging) {
    let uniqueLines = []
    const array1 = []
    const array2 = []

    for (let i = 0; i < intersections.length; i++) {
      if (i === 0) {
        array1.push(intersections[i])
      } else {
        array1.forEach(item => {
          if (item.object.uuid !== intersections[i].object.uuid) {
            array2.push(intersections[i])
          }
        })
      }
      uniqueLines = array1.concat(array2)
    }

    dragInitialParticle(uniqueLines)
  }
}

function dragInitialParticle (uniqueLines) {
  uniqueLines.forEach(line => {
    const i3 = line.index * 3

    line.object.geometry.attributes.position.array[i3 + 1] = mouse.y
    line.object.geometry.attributes.position.needsUpdate = true

    if (movingParticles.length === 0) {
      movingParticles.push({
        particleIndex: line.index,
        line
      })
    }
  })
}

window.addEventListener('mousemove', onMouseMove)
window.addEventListener('mousedown', onMouseDown)
window.addEventListener('mouseup', onMouseUp)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = false

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  // const elapsedTime = clock.getElapsedTime()

  maybeMoveParticles()

  controls.update()
  renderer.render(scene, camera)

  window.requestAnimationFrame(tick)
}

tick()

/* Utils */

function setMousePosition (event) {
  event.preventDefault()
  var rect = canvas.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

function maybeMoveParticles () {
  if (animateParticles && movingParticles.length) {
    const i3 = movingParticles[0].particleIndex * 3
    const position = movingParticles[0].line.object.geometry.attributes.position

    moveParticleToStartCollisions(i3, position)
    findCollisions(
      movingParticles[0].line.object.uuid,
      movingParticles[0].particleIndex
    )
  }
}

// Debug Panel
// gui
//   .add(particleParams, 'size')
//   .min(0)
//   .max(0.3)
//   .step(0.01)
//   .name('particleSize')
// gui
//   .add(particleParams, 'count')
//   .min(0)
//   .max(10)
//   .step(1)
//   .name('lineCount')
