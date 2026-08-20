import React from 'react'
import ExampleCard from './components/ExampleCard'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Vite React + Tailwind (Custom Colors)</h1>
        <ExampleCard />
      </div>
    </div>
  )
}
