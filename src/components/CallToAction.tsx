import { Link } from 'react-router-dom'
import { Leaf, Users } from 'lucide-react'

export const CallToAction = () => (
  <div className="text-center mt-24">
    <div className="liquid-glass rounded-3xl p-12 max-w-3xl mx-auto">
      <h3 className="text-3xl font-bold gradient-text mb-6">Ready to Grow?</h3>
      <p className="text-xl text-muted-foreground mb-8">
        Start cultivating more meaningful conversations today
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          to="/create"
          className="liquid-glass px-8 py-4 rounded-2xl text-primary font-semibold hover:scale-105 transition-all duration-300 flex items-center"
        >
          Plant a Meeting
          <Leaf className="ml-2 w-5 h-5" />
        </Link>
        <Link
          to="/manual"
          className="liquid-glass px-8 py-4 rounded-2xl text-accent font-semibold hover:scale-105 transition-all duration-300 flex items-center"
        >
          Manual Mode
          <Users className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </div>
  </div>
)

export default CallToAction
