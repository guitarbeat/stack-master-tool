
import { Hero } from '@/components/Hero'
import { ActionCards } from '@/components/ActionCards'

function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden" role="main">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <Hero />
        <section aria-labelledby="action-cards-heading" className="mb-8 sm:mb-12">
          <h2 id="action-cards-heading" className="sr-only">Main Actions</h2>
          <ActionCards />
        </section>
      </div>
    </main>
  )
}

export default HomePage
