import { Link } from "react-router-dom";
import { MEETING_MODES } from "./constants";

export const ActionCards = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid gap-6 md:grid-cols-3">
        {Object.values(MEETING_MODES).map((mode) => (
          <Link
            key={mode.id}
            to={`/meeting?mode=${mode.id}`}
            className="block p-6 bg-card text-card-foreground border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-4">{mode.emoji}</div>
              <h3 className="text-lg font-semibold mb-2">{mode.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{mode.shortDesc}</p>
              <div className="text-sm font-medium text-primary">
                {mode.id === 'host' ? 'Start Hosting' : mode.id === 'join' ? 'Join Meeting' : 'Watch Meeting'}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ActionCards;
