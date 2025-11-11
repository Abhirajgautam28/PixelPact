import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { vi, beforeAll, afterAll, test, expect } from 'vitest'
import Whiteboard from '../pages/Whiteboard'

beforeAll(()=>{
  // Provide minimal canvas getContext implementation used by Whiteboard
  HTMLCanvasElement.prototype.getContext = function(){
    return {
      drawImage: ()=>{}, clearRect: ()=>{}, getImageData: ()=> ({ data: new Uint8ClampedArray(4) }), putImageData: ()=>{},
      beginPath: ()=>{}, moveTo: ()=>{}, lineTo: ()=>{}, stroke: ()=>{}, fillText: ()=>{}, save: ()=>{}, restore: ()=>{},
      strokeRect: ()=>{}, ellipse: ()=>{}, setLineDash: ()=>{}, fillRect: ()=>{}
    }
  }
  HTMLCanvasElement.prototype.toDataURL = function(){ return 'data:image/png;base64,TEST' }
})

afterAll(()=>{
  // cleanup potential overrides
  try{ delete HTMLCanvasElement.prototype.getContext }catch(e){}
  try{ delete HTMLCanvasElement.prototype.toDataURL }catch(e){}
})

test('export PNG and high-res produce downloadable data URLs', async ()=>{
  const appendSpy = vi.spyOn(document.body, 'appendChild')
  render(<Whiteboard />)

  // find Export button and the hidden dropdown buttons by text
  const pngBtn = screen.getByText('PNG', { selector: 'button' })
  const highBtn = screen.getByText('High-res PNG', { selector: 'button' })

  let appended = null
  appendSpy.mockImplementation((el)=>{ appended = el; return el })

  fireEvent.click(pngBtn)
  expect(appended).toBeTruthy()
  expect(appended.href).toContain('data:image/png')

  appended = null
  fireEvent.click(highBtn)
  expect(appended).toBeTruthy()
  expect(appended.href).toContain('data:image/png')

  appendSpy.mockRestore()
})
