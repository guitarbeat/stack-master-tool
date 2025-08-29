import { Link } from 'react-router-dom'
import { Leaf, Users } from 'lucide-react'

export const CallToAction = () => (
  <div className="text-center mt-16 sm:mt-20 lg:mt-24">
    <div className="liquid-glass rounded-2xl sm:rounded-3xl p-8 sm:p-12 max-w-3xl mx-auto">
      <h3 className="text-2xl sm:text-3xl font-bold gradient-text mb-4 sm:mb-6">Ready to Grow?</h3>
      <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 px-4">
        Start cultivating more meaningful conversations today
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          to="/create"
          className="liquid-glass px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-primary font-semibold hover:scale-105 transition-all duration-300 flex items-center w-full sm:w-auto justify-center"
        >
          Plant a Meeting
          <Leaf className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
        </Link>
        <Link
          to="/manual"
          className="liquid-glass px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-accent font-semibold hover:scale-105 transition-all duration-300 flex items-center w-full sm:w-auto justify-center"
        >
          Manual Mode
          <Users className="ml-2 w-4 sm:w-5 h-4 sm:h-5" />
        </Link>
      </div>
    </div>
  </div>
)

export default CallToAction
