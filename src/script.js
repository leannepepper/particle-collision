import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
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
const mouse = new THREE.Vector2()
const raycaster = new THREE.Raycaster()
raycaster.params.Points.threshold = threshold

const lines = []
const movingParticles = []
let dragging = false
let animateParticles = false

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

    moveLineParticles(uniqueLines)
  }
}

function moveLineParticles (uniqueLines) {
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
let i = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  if (animateParticles && movingParticles.length) {
    const i3 = movingParticles[0].particleIndex * 3
    const position = movingParticles[0].line.object.geometry.attributes.position

    position.array[i3 + 1] += Math.sin(i * 0.3) * 0.09
    position.array[i3] += Math.sin(i * 0.1) * 0.08

    position.needsUpdate = true

    findCollisions(
      movingParticles[0].line.object.uuid,
      movingParticles[0].particleIndex
    )
  }

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)

  i++
}

tick()

/* Utils */

function randomIntFromInterval (min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function setMousePosition (event) {
  event.preventDefault()
  var rect = canvas.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

function findCollisions (id, index) {
  const activeParticleLine = lines.filter(line => line.mesh.uuid === id)

  for (let i = 0; i < lines.length; i++) {
    const particleCount = lines[i].mesh.geometry.attributes.position.count

    for (let j = 0; j < particleCount; j++) {
      if (j != index) {
        activeParticleLine[0].checkForCollision(index, {
          lineToCheck: lines[i],
          particleIndex2: j
        })
      }
    }
  }
}
