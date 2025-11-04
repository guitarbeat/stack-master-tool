import { Link } from "react-router-dom";
import { MEETING_MODES } from "./constants";

export const ActionCards = () => {

  return (
    <div className="max-w-6xl mx-auto">
      {/* * Action Cards */}
      <div className="grid gap-8 md:grid-cols-3 mb-16">
        {Object.values(MEETING_MODES).map((mode) => (
          <Link
            key={mode.id}
            to={mode.id === 'host' ? '/facilitator' : `/meeting?mode=${mode.id}`}
            className={`group block p-8 bg-card text-card-foreground border-2 ${mode.borderColor} rounded-2xl hover:shadow-xl hover:scale-[1.02] ${mode.hoverColor} transition-all duration-300 relative overflow-hidden`}
          >
            {/* Background gradient blob */}
            <div className={`absolute inset-0 ${mode.bgBlob} rounded-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-300`}></div>

            <div className="text-center relative z-10">
              {/* Icon with gradient background */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${mode.gradient} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <span className="text-2xl">{mode.emoji}</span>
              </div>

              <h3 className={`text-xl font-bold mb-2 ${mode.color}`}>{mode.title}</h3>
              <p className="text-sm font-medium text-muted-foreground mb-1">{mode.shortDesc}</p>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{mode.fullDesc}</p>

              {/* * Key features for each mode */}
              <div className="space-y-3 mb-6">
                {mode.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${mode.gradient} flex-shrink-0`}></div>
                    <span className="text-left">{feature}</span>
                  </div>
                ))}
              </div>

              <div className={`text-sm font-semibold ${mode.color} group-hover:opacity-80 transition-opacity inline-flex items-center gap-2`}>
                <span>
                  {mode.id === 'host' ? 'Create Meeting' : mode.id === 'join' ? 'Join Discussion' : 'Start Watching'}
                </span>
                <span className="text-lg">→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ActionCards;
