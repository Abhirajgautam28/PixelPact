import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Hero3D({ className = '', style = {} }){
  const ref = useRef(null)

  useEffect(()=>{
    const mount = ref.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
    mount.appendChild(renderer.domElement)

    // lights
    const amb = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(amb)
    const key = new THREE.DirectionalLight(0xffffff, 0.9)
    key.position.set(5, 5, 5)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0x6bb9ff, 0.4)
    fill.position.set(-3, -2, 2)
    scene.add(fill)

    // central mesh (rounded torus-like ring) - tuned for Dora-like purple/blue palette
    const geo = new THREE.TorusKnotGeometry(1.05, 0.16, 128, 32, 2, 3)
    const mat = new THREE.MeshStandardMaterial({ color: 0x5b21b6, metalness: 0.32, roughness: 0.22, emissive: 0x2a0560 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = 0.8
    mesh.rotation.y = 0.6
    scene.add(mesh)

    // surrounding subtle shards (reduced count for performance)
    const shardGeo = new THREE.IcosahedronGeometry(0.05, 0)
    const shardMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, metalness: 0.18, roughness: 0.45, emissive: 0x001022 })
    const shards = new THREE.Group()
    for (let i = 0; i < 20; i++) {
      const s = new THREE.Mesh(shardGeo, shardMat)
      const r = 1.5 + Math.random() * 1.4
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI
      s.position.set(Math.cos(theta) * Math.cos(phi) * r, Math.sin(phi) * r * 0.55, Math.sin(theta) * Math.cos(phi) * r)
      s.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
      s.scale.setScalar(0.5 + Math.random() * 0.7)
      shards.add(s)
    }
    scene.add(shards)

    // particles
    const pCount = 120
    const pPos = new Float32Array(pCount * 3)
    for(let i=0;i<pCount;i++){
      pPos[i*3+0] = (Math.random() - 0.5) * 8
      pPos[i*3+1] = (Math.random() - 0.5) * 4
      pPos[i*3+2] = (Math.random() - 0.5) * 6
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({ color: 0xc7d2fe, size: 0.015, transparent: true, opacity: 0.82 })
    const points = new THREE.Points(pGeo, pMat)
    scene.add(points)

    // animation
    let raf = null
    const clock = new THREE.Clock()
    const pointer = { x: 0.5, y: 0.5 }
    function animate(){
      const t = clock.getElapsedTime()
      mesh.rotation.y += 0.004
      mesh.rotation.x += 0.0016
      shards.children.forEach((s, i)=>{
        s.rotation.y += 0.0016 + (i % 3) * 0.0006
        s.position.y += Math.sin(t * 0.28 + i) * 0.00045
      })
      // subtle parallax
      const tx = (pointer.x - 0.5) * 0.7
      const ty = (pointer.y - 0.5) * 0.5
      camera.position.x += (tx - camera.position.x) * 0.05
      camera.position.y += (ty - camera.position.y) * 0.05
      camera.lookAt(0,0,0)

      // particle drift
      const arr = pGeo.attributes.position.array
      for(let i=0;i<pCount;i++) arr[i*3+1] += Math.sin(t*0.18 + i) * 0.00025
      pGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }
    animate()

    function onPointer(e){
      const r = mount.getBoundingClientRect()
      pointer.x = (e.clientX - r.left) / r.width
      pointer.y = (e.clientY - r.top) / r.height
    }
    window.addEventListener('pointermove', onPointer)

    const ro = new ResizeObserver(()=>{
      const w = mount.clientWidth; const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    ro.observe(mount)

    // visibility
    function onVis(){ if (document.hidden){ if (raf) cancelAnimationFrame(raf); raf = null } else { if (!raf) animate() } }
    document.addEventListener('visibilitychange', onVis)

    return ()=>{
      window.removeEventListener('pointermove', onPointer)
      document.removeEventListener('visibilitychange', onVis)
      if (raf) cancelAnimationFrame(raf)
      ro.disconnect()
      try{ pGeo.dispose(); pMat && pMat.dispose(); }catch(e){}
      try{ geo.dispose(); mat.dispose(); }catch(e){}
      renderer.dispose()
      if (renderer.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', ...style }} ref={ref} />
  )
}
