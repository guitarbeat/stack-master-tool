import { Link } from "react-router-dom";
import { MEETING_MODES } from "./constants";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export const ActionCards = () => {
  const hostMode = MEETING_MODES.host;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid gap-8 mb-16">
        <Link
          key={hostMode.id}
          to={`/meeting?mode=${hostMode.id}`}
          className="group block transition-all hover:scale-105 hover:-translate-y-1 duration-300"
        >
          <Card className={`h-full border-2 ${hostMode.borderColor} hover:shadow-glow transition-all duration-300 animate-fade-in`} variant="interactive">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-3xl">{hostMode.emoji}</span>
              </div>
              <h3 className={`text-xl font-bold ${hostMode.color}`}>{hostMode.title}</h3>
              <Badge variant="secondary" className="mx-auto mt-2">
                {hostMode.shortDesc}
              </Badge>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {hostMode.fullDesc}
              </p>

              <div className="space-y-2">
                {hostMode.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-left">{feature}</span>
                  </div>
                ))}
              </div>

              <div className={`text-sm font-semibold ${hostMode.color} inline-flex items-center gap-2 pt-2`}>
                <span>Create Meeting</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default ActionCards;
