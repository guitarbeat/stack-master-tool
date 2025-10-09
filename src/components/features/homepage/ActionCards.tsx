import { Link } from "react-router-dom";
import { MEETING_MODES } from "./constants";
import { Shield, Clock, Users2, Zap } from "lucide-react";

export const ActionCards = () => {
  // * Key features to highlight without redundancy
  const keyFeatures = [
    { icon: Shield, text: "Democratic Process" },
    { icon: Clock, text: "Fair Turn-Taking" },
    { icon: Users2, text: "Inclusive Design" },
    { icon: Zap, text: "Real-time Sync" }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* * Action Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-16">
        {Object.values(MEETING_MODES).map((mode) => (
          <Link
            key={mode.id}
            to={`/meeting?mode=${mode.id}`}
            className="group block p-8 bg-card text-card-foreground border rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <div className="text-center">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {mode.emoji}
              </div>
              <h3 className="text-xl font-bold mb-3">{mode.title}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{mode.fullDesc}</p>
              
              {/* * Key features for each mode */}
              <div className="space-y-2 mb-6">
                {mode.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                {mode.id === 'host' ? 'Start Hosting →' : mode.id === 'join' ? 'Join Meeting →' : 'Watch Meeting →'}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* * Key Features Overview - Simplified */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-8">Why Choose Stack Master?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {keyFeatures.map((feature, index) => (
            <div key={index} className="flex flex-col items-center gap-3 p-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground text-center">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionCards;
