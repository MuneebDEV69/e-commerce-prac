import React from 'react'

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto py-12">
      <section className="mb-12">
        <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-4xl font-serif">Premium Luxury Bedding</h1>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Curated For You</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-48 h-48 bg-gray-200 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="h-72 bg-gray-100 rounded-md mb-4" />
            <h3 className="font-semibold">Section Title</h3>
            <p className="text-sm text-gray-600">Short description about this collection.</p>
          </div>
        ))}
      </section>
    </div>
  )
}
