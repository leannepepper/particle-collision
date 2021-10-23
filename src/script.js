import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

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

/**
 * Geometry
 */
const particleGeometry = new THREE.BoxBufferGeometry(1.0, 1.0, 1.0)
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
  size: 1.3,
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
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

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

  const intersections = raycaster.intersectObjects([particles], false)
  intersection = intersections.length > 0 ? intersections[0] : null

  if (intersection) {
    intersection.object.geometry.attributes.position.array[1] = 10
    particleGeometry.attributes.position.needsUpdate = true

    console.log(intersection, particles)
  }
  // Update Particles

  //particles.rotation.y = elapsedTime * 0.2
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    const x = particleGeometry.attributes.position.array[i3]
    particleGeometry.attributes.position.array[i3 + 1] = Math.cos(
      elapsedTime + x * 0.2
    )
  }
  particleGeometry.attributes.position.needsUpdate = true

  // Update controls
  //   controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
