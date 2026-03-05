'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const COURSES = [
  {
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1400&h=600&fit=crop&crop=center',
    title: 'Augusta National',
    subtitle: 'Where legends are made',
  },
  {
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1400&h=600&fit=crop&crop=center',
    title: 'Morning Fairway',
    subtitle: 'Golden hour on the green',
  },
  {
    image: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=1400&h=600&fit=crop&crop=center',
    title: 'Ocean Links',
    subtitle: 'Where the course meets the coast',
  },
  {
    image: 'https://images.unsplash.com/photo-1600011689032-8b628b8a8747?w=1400&h=600&fit=crop&crop=center',
    title: 'The Perfect Green',
    subtitle: 'Manicured to perfection',
  },
  {
    image: 'https://images.unsplash.com/photo-1622396636133-8e22891a3950?w=1400&h=600&fit=crop&crop=center',
    title: 'Sunset Round',
    subtitle: 'Every round ends with a view',
  },
]

export function GolfCarousel() {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % COURSES.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + COURSES.length) % COURSES.length)
  }, [])

  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(next, 4500)
    return () => clearInterval(timer)
  }, [next, isHovered])

  return (
    <section
      className="relative overflow-hidden bg-dark-950"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel container */}
      <div className="relative h-[420px] sm:h-[500px] lg:h-[560px]">
        {COURSES.map((course, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-all duration-700 ease-in-out"
            style={{
              opacity: i === current ? 1 : 0,
              transform: i === current ? 'scale(1)' : 'scale(1.05)',
            }}
          >
            {/* Image */}
            <img
              src={course.image}
              alt={course.title}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-950/60 via-transparent to-dark-950/60" />

            {/* Content */}
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-7xl mx-auto w-full px-6 pb-16 sm:pb-20">
                <div
                  className="transition-all duration-700 delay-200"
                  style={{
                    opacity: i === current ? 1 : 0,
                    transform: i === current ? 'translateY(0)' : 'translateY(20px)',
                  }}
                >
                  <p className="text-emerald-400 text-sm font-semibold tracking-wider uppercase mb-2">
                    Featured Course
                  </p>
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-300 text-lg">{course.subtitle}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition-all z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition-all z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {COURSES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current
                ? 'w-8 h-2.5 bg-emerald-400'
                : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
