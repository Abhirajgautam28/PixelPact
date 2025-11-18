import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground({ intensity = 0.6 }){
  const mountRef = useRef(null)

  useEffect(()=>{
    const mount = mountRef.current
    if (!mount) return

    // basic scene with layered moving objects and particles for depth
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0'
    renderer.domElement.style.left = '0'
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    renderer.setClearColor(0x0b1220, 0)
    mount.appendChild(renderer.domElement)

    // lights
    const ambient = new THREE.AmbientLight(0xffffff, intensity * 0.6)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, intensity * 0.8)
    dir.position.set(5, 5, 5)
    scene.add(dir)

    // layered geometric groups
    const groups = []
    const palette = [0x4f46e5, 0x60a5fa, 0x7c3aed, 0x06b6d4]
    for(let g=0; g<3; g++){
      const group = new THREE.Group()
      const count = 6 - g*2
      for(let i=0;i<count;i++){
        const geom = new THREE.TorusGeometry(0.9 - g*0.18, 0.02 + g*0.01, 8, 64)
        const mat = new THREE.MeshStandardMaterial({ color: palette[(i+g) % palette.length], metalness: 0.4, roughness: 0.3, emissive: 0x000000, opacity: 0.95, transparent: true })
        const mesh = new THREE.Mesh(geom, mat)
        mesh.rotation.x = Math.PI/2
        mesh.position.x = (i - count/2) * 1.4
        mesh.position.y = (g-1) * 0.6 + (Math.random()-0.5)*0.2
        mesh.position.z = -g * 0.6
        mesh.scale.setScalar(0.9 - g*0.08)
        group.add(mesh)
      }
      groups.push(group)
      scene.add(group)
    }

    // particle cloud
    const particleCount = 220
    const positions = new Float32Array(particleCount * 3)
    for(let i=0;i<particleCount;i++){
      positions[i*3+0] = (Math.random() - 0.5) * 8
      positions[i*3+1] = (Math.random() - 0.5) * 3
      positions[i*3+2] = (Math.random() - 0.5) * 6
    }
    const pgeo = new THREE.BufferGeometry()
    pgeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const pmat = new THREE.PointsMaterial({ color: 0xa8bfff, size: 0.02, transparent: true, opacity: 0.9 })
    const points = new THREE.Points(pgeo, pmat)
    scene.add(points)

    // animation
    let req = null
    const clock = new THREE.Clock()
    const pointer = { x: 0.5, y: 0.5 }
    function animate(){
      const t = clock.getElapsedTime()
      // rotate groups slowly
      groups.forEach((group, i)=>{
        group.rotation.z += 0.002 + i*0.001
        group.position.x = Math.sin(t * (0.2 + i*0.05)) * 0.2
      })
      // small parallax camera move
      const targetX = (pointer.x - 0.5) * 1.6
      const targetY = (pointer.y - 0.5) * 0.8
      camera.position.x += (targetX - camera.position.x) * 0.04
      camera.position.y += (targetY - camera.position.y) * 0.04
      camera.lookAt(0, 0, 0)

      // particles subtle drift
      const pos = pgeo.attributes.position.array
      for(let i=0;i<particleCount;i+=3){
        const idx = (i/3)
        pos[idx*3 + 1] += Math.sin(t * 0.3 + idx) * 0.0002
      }
      pgeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
      req = requestAnimationFrame(animate)
    }
    animate()

    // pointer
    function onPointer(e){
      const rect = mount.getBoundingClientRect()
      pointer.x = (e.clientX - rect.left) / rect.width
      pointer.y = (e.clientY - rect.top) / rect.height
    }
    window.addEventListener('pointermove', onPointer)

    // resize
    const ro = new ResizeObserver(()=>{
      const w = mount.clientWidth; const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(mount)

    // visibility
    function onVisibility(){ if (document.hidden){ if (req) cancelAnimationFrame(req); req = null } else { if (!req) animate() } }
    document.addEventListener('visibilitychange', onVisibility)

    return ()=>{
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
      if (req) cancelAnimationFrame(req)
      ro.disconnect()
      try{ pgeo.dispose(); pmat.dispose(); }catch(e){}
      renderer.dispose()
      if (renderer.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [intensity])

  return (
    <div aria-hidden="true" ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
  )
}
