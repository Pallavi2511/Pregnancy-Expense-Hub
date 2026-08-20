import React from 'react'

export default function ExampleCard(){
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <p className="text-gray-600 mb-4">This demo uses the custom Tailwind colors:</p>
      <div className="flex gap-3">
        <div className="flex-1 p-4 rounded-md bg-primary text-white">Primary</div>
        <div className="flex-1 p-4 rounded-md bg-secondary text-white">Secondary</div>
        <div className="flex-1 p-4 rounded-md bg-accent text-white">Accent</div>
      </div>
      <div className="mt-4">
        <button className="btn-primary">Primary Action</button>
      </div>
    </div>
  )
}
