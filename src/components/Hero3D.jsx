import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function Hero3D({
  className = '',
  style = {},
  // recommended saturated purple
  color = 0x6d28d9,
  // subtle emissive tint for glow
  emissive = 0x2a0a4b,
  // default to lathe for softer organic silhouette (Dora-like)
  shape = 'lathe', // 'torusknot' or 'lathe'
  // particle count tuned for clarity and perf
  pCount = 80,
  // warm key light for pleasing skin-tone-like highlights
  keyLightColor = 0xffc58f,
} = {}){
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
    // lighting: ambient + warm key + cool rim + hemisphere fill
    const amb = new THREE.AmbientLight(0xffffff, 0.42)
    scene.add(amb)
    const key = new THREE.DirectionalLight(keyLightColor, 1.0)
    key.position.set(4.5, 5, 4)
    key.castShadow = false
    scene.add(key)
    // cool rim/back light for separation
    const rim = new THREE.PointLight(0x5ee0ff, 0.45, 12)
    rim.position.set(-3, 1.8, -2)
    scene.add(rim)
    // hemisphere for soft sky/ground fill
    const hemi = new THREE.HemisphereLight(0xddeeff, 0x101020, 0.35)
    scene.add(hemi)

    // central mesh (rounded torus-like ring) - tunable via props
    let geo
    if (shape === 'lathe'){
      // create a smooth lathe/profile for a softer Dora-like object
      const pts = []
      for (let i = 0; i < 8; i++) {
        const a = (i / 7) * Math.PI
        const r = 0.6 + Math.sin(a) * 0.5
        pts.push(new THREE.Vector2(r, (i / 7) * 1.6 - 0.8))
      }
      geo = new THREE.LatheGeometry(pts, 64)
    } else {
      geo = new THREE.TorusKnotGeometry(1.05, 0.16, 128, 32, 2, 3)
    }
    // use physical material for subtle sheen/clearcoat without heavy postprocessing
    const mat = new THREE.MeshPhysicalMaterial({ color, metalness: 0.18, roughness: 0.22, emissive, emissiveIntensity: 0.18, clearcoat: 0.18, clearcoatRoughness: 0.25 })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = 0.8
    mesh.rotation.y = 0.6
    scene.add(mesh)

    // surrounding subtle shards (reduced count for performance)
    const shardGeo = new THREE.IcosahedronGeometry(0.04, 0)
    const shardMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, metalness: 0.12, roughness: 0.5, emissive: 0x001022 })
    const shards = new THREE.Group()
    for (let i = 0; i < 12; i++) {
      const s = new THREE.Mesh(shardGeo, shardMat)
      const r = 1.5 + Math.random() * 1.4
      const theta = Math.random() * Math.PI * 2
      const phi = (Math.random() - 0.5) * Math.PI
      s.position.set(Math.cos(theta) * Math.cos(phi) * r, Math.sin(phi) * r * 0.55, Math.sin(theta) * Math.cos(phi) * r)
      s.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
      s.scale.setScalar(0.35 + Math.random() * 0.6)
      shards.add(s)
    }
    scene.add(shards)

    // particles
    const particleCount = Math.max(24, Math.min(220, pCount))
    const pPos = new Float32Array(particleCount * 3)
    for(let i=0;i<particleCount;i++){
      pPos[i*3+0] = (Math.random() - 0.5) * 7.2
      pPos[i*3+1] = (Math.random() - 0.5) * 3.2
      pPos[i*3+2] = (Math.random() - 0.5) * 5.2
    }
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    const pMat = new THREE.PointsMaterial({ color: 0xbdb5ff, size: 0.016, sizeAttenuation: true, transparent: true, opacity: 0.9 })
    const points = new THREE.Points(pGeo, pMat)
    scene.add(points)

    // subtle fog for depth
    scene.fog = new THREE.FogExp2(0x04061c, 0.018)

    // animation
    let raf = null
    const clock = new THREE.Clock()
    const pointer = { x: 0.5, y: 0.5 }
    function animate(){
      const t = clock.getElapsedTime()
      // organic motion: gentle rotation + breathing scale
      mesh.rotation.y += 0.0035
      mesh.rotation.x = 0.6 + Math.sin(t * 0.32) * 0.06
      const breath = 1 + Math.sin(t * 0.6) * 0.012
      mesh.scale.setScalar(breath)
      shards.children.forEach((s, i)=>{
        s.rotation.y += 0.0009 + (i % 3) * 0.0004
        s.position.y += Math.sin(t * 0.18 + i) * 0.00035
      })
      // subtle parallax
      const tx = (pointer.x - 0.5) * 0.7
      const ty = (pointer.y - 0.5) * 0.5
      camera.position.x += (tx - camera.position.x) * 0.05
      camera.position.y += (ty - camera.position.y) * 0.05
      camera.lookAt(0,0,0)

      // particle drift
      const arr = pGeo.attributes.position.array
      for(let i=0;i<particleCount;i++) arr[i*3+1] += Math.sin(t*0.16 + i) * 0.00018
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
      try{ shardGeo.dispose(); shardMat && shardMat.dispose(); }catch(e){}
      try{ if (geo && geo.dispose) geo.dispose(); }catch(e){}
      try{ if (mat && mat.dispose) mat.dispose(); }catch(e){}
      try{ renderer.renderLists && renderer.renderLists.dispose && renderer.renderLists.dispose(); }catch(e){}
      renderer.dispose()
      if (renderer.domElement && mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div className={className} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', ...style }} ref={ref} />
  )
}
