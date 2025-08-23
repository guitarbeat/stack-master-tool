import { useEffect, useRef } from 'react'

export default function useTiltEffect() {
  const cardsRef = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    const cards = cardsRef.current

    const handleMouseMove = (e: MouseEvent) => {
      cards.forEach(card => {
        if (!card) return
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        const rotateX = (y / rect.height) * -10
        const rotateY = (x / rect.width) * 10
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      })
    }

    const handleMouseLeave = (card: HTMLDivElement) => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
    }

    document.addEventListener('mousemove', handleMouseMove)
    cards.forEach(card => {
      if (card) {
        card.addEventListener('mouseleave', () => handleMouseLeave(card))
      }
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      cards.forEach(card => {
        if (card) {
          card.removeEventListener('mouseleave', () => handleMouseLeave(card))
        }
      })
    }
  }, [])

  return cardsRef
}
