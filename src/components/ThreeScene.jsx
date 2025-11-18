import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeScene({ width = '100%', height = '220px' }){
  const mountRef = useRef(null)

  useEffect(()=>{
    const mount = mountRef.current
    if (!mount) return

    // Scene / camera / renderer
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(0, 1.2, 3)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(5,5,5)
    scene.add(dir)

    // Main mesh: rounded box like object (simple box) with soft emissive rim
    const geom = new THREE.BoxGeometry(1.2, 0.8, 0.6)
    const mat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, metalness: 0.25, roughness: 0.35, emissive: 0x18204a, emissiveIntensity: 0.08 })
    const mesh = new THREE.Mesh(geom, mat)
    mesh.rotation.x = 0.25
    mesh.rotation.y = -0.5
    scene.add(mesh)

    // Accent rotating ring (thin torus) for visual interest
    const ringGeo = new THREE.TorusGeometry(0.9, 0.02, 8, 64)
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, metalness: 0.6, roughness: 0.2, emissive: 0x2b6cf6, emissiveIntensity: 0.12 })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = Math.PI / 2
    ring.position.y = -0.05
    scene.add(ring)

    // Subtle particle field using Points (increased density, lightweight update)
    const particleCount = 140
    const positions = new Float32Array(particleCount * 3)
    for(let i=0;i<particleCount;i++){
      const theta = Math.random() * Math.PI * 2
      const r = 1.6 + (Math.random() - 0.5) * 0.5
      positions[i*3 + 0] = Math.cos(theta) * r
      positions[i*3 + 1] = (Math.random() - 0.5) * 0.5
      positions[i*3 + 2] = Math.sin(theta) * r
    }
    const pgeo = new THREE.BufferGeometry()
    pgeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const pmat = new THREE.PointsMaterial({ color: 0x60a5fa, size: 0.018, transparent: true, opacity: 0.9 })
    const points = new THREE.Points(pgeo, pmat)
    scene.add(points)

    // Animation + interaction
    let req = null
    const clock = new THREE.Clock()
    const pointer = { x: 0, y: 0 }
    function animate(){
      const t = clock.getElapsedTime()
      // rotate main mesh and ring
      mesh.rotation.y += 0.006
      mesh.position.y = Math.sin(t * 0.8) * 0.03
      ring.rotation.z += 0.008
      // parallax camera target based on pointer
      const targetX = (pointer.x - 0.5) * 0.6
      const targetY = (pointer.y - 0.5) * 0.2 + 1.2
      camera.position.x += (targetX - camera.position.x) * 0.05
      camera.position.y += (targetY - camera.position.y) * 0.05
      camera.lookAt(0, 0.4, 0)
      // gentle particle animation (small, low-cost motion)
      const pos = pgeo.attributes.position.array
      for(let i=0;i<particleCount;i+=3){
        // only update a subset per frame to reduce cost
        const idx = (i % particleCount)
        pos[idx*3 + 1] += Math.sin(t + idx) * 0.00035
      }
      pgeo.attributes.position.needsUpdate = true
      renderer.render(scene, camera)
      req = requestAnimationFrame(animate)
    }
    animate()

    // pointer handling for parallax
    function onPointer(e){
      const rect = mount.getBoundingClientRect()
      pointer.x = (e.clientX - rect.left) / rect.width
      pointer.y = (e.clientY - rect.top) / rect.height
    }
    mount.addEventListener('pointermove', onPointer)

    // Pause animation when not visible to save cycles
    function onVisibility(){
      if (document.hidden){ if (req) cancelAnimationFrame(req); req = null } else { if (!req) { clock.getDelta(); animate() } }
    }
    document.addEventListener('visibilitychange', onVisibility)

    // Resize observer for mount sizing (more reliable than window resize alone)
    const ro = new ResizeObserver(()=>{
      const w = mount.clientWidth; const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(mount)

    // cleanup
    return ()=>{
      mount.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
      if (req) cancelAnimationFrame(req)
      ro.disconnect()
      // dispose geometries & materials
      try{
        geom.dispose(); mat.dispose(); ringGeo.dispose(); ringMat.dispose(); pgeo.dispose(); pmat.dispose()
      }catch(e){}
      renderer.dispose()
      if (renderer.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ width, height }} aria-hidden="true" />
}
