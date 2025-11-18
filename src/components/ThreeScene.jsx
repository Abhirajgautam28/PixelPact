import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeScene({ width = '100%', height = '220px' }){
  const mountRef = useRef(null)

  useEffect(()=>{
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, mount.clientWidth / mount.clientHeight, 0.1, 1000)
    camera.position.set(0, 1.2, 3)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio || 1)
    mount.appendChild(renderer.domElement)

    // simple ambient + directional lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambient)
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(5,5,5)
    scene.add(dir)

    // geometry: rounded-ish box using standard material
    const geom = new THREE.BoxGeometry(1.2, 0.8, 0.6)
    const mat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, metalness: 0.3, roughness: 0.4 })
    const mesh = new THREE.Mesh(geom, mat)
    mesh.rotation.x = 0.3
    mesh.rotation.y = -0.6
    scene.add(mesh)

    // subtle floating animation
    let req = null
    const clock = new THREE.Clock()
    function animate(){
      const t = clock.getElapsedTime()
      mesh.rotation.y += 0.01
      mesh.position.y = Math.sin(t) * 0.04
      renderer.render(scene, camera)
      req = requestAnimationFrame(animate)
    }
    animate()

    // responsiveness
    function onResize(){
      const w = mount.clientWidth; const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w,h)
    }
    window.addEventListener('resize', onResize)

    return ()=>{
      window.removeEventListener('resize', onResize)
      if (req) cancelAnimationFrame(req)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ width, height }} aria-hidden="true" />
}
