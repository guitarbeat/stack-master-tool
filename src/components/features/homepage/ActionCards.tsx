import { Link } from "react-router-dom";
import { MEETING_MODES } from "./constants";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export const ActionCards = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid gap-8 md:grid-cols-3 mb-16">
        {Object.values(MEETING_MODES).map((mode, index) => (
          <Link
            key={mode.id}
            to={`/meeting?mode=${mode.id}`}
            className="group block transition-all hover:scale-105 hover:-translate-y-1 duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Card className={`h-full border-2 ${mode.borderColor} hover:shadow-xl transition-all duration-300 animate-fade-in`}>
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">{mode.emoji}</span>
                </div>
                <h3 className={`text-xl font-bold ${mode.color}`}>{mode.title}</h3>
                <Badge variant="secondary" className="mx-auto mt-2">
                  {mode.shortDesc}
                </Badge>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {mode.fullDesc}
                </p>

                <div className="space-y-2">
                  {mode.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span className="text-left">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className={`text-sm font-semibold ${mode.color} inline-flex items-center gap-2 pt-2`}>
                  <span>
                    {mode.id === 'host' ? 'Create Meeting' : mode.id === 'join' ? 'Join Discussion' : 'Start Watching'}
                  </span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ActionCards;
