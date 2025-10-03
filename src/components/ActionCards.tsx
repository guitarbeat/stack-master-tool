import { Link } from "react-router-dom";
import {
  QrCode,
  ArrowRight,
  Users,
  Sparkles,
  CheckCircle,
  Eye,
} from "lucide-react";
import useTiltEffect from "@/hooks/use-tilt";

export const ActionCards = () => {
  const cardsRef = useTiltEffect();

  const actions = [
    {
      to: "/stack",
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Start Facilitating",
      description:
        "Begin with local stack management. Enable remote access anytime to let participants join with a code.",
      cta: "Start Now",
      emoji: "🎯",
      gradient: "from-primary to-accent",
      bgBlob: "bg-primary/10",
      features: [
        "Local stack management",
        "Enable remote access",
        "Unified experience",
      ],
    },
    {
      to: "/join",
      icon: <QrCode className="w-8 h-8 text-accent" />,
      title: "Join Meeting",
      description:
        "Enter a meeting code to join an existing discussion and participate in the speaking queue.",
      cta: "Join Now",
      emoji: "🌿",
      gradient: "from-accent to-accent/80",
      bgBlob: "bg-accent/10",
      features: [
        "Enter meeting code",
        "Join active discussion",
        "Contribute to dialogue",
      ],
    },
    {
      to: "/watch",
      icon: <Eye className="w-8 h-8 text-primary" />,
      title: "Watch Meeting",
      description:
        "Enter a meeting code to watch in read-only mode. Perfect for observers and stakeholders.",
      cta: "Watch Now",
      emoji: "👁️",
      gradient: "from-primary to-primary/80",
      bgBlob: "bg-primary/10",
      features: [
        "Enter meeting code",
        "Read-only viewing",
        "No participation required",
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Choose Your Path</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-4">
          Get
          <span className="text-primary"> Started</span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Choose how you want to use the stack facilitation tool
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
        {actions.map((action, index) => (
          <div
            key={index}
            ref={el => (cardsRef.current[index] = el)}
            className="tilt-card group"
          >
            <Link to={action.to} className="block h-full">
              <div className="liquid-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 h-full transition-all duration-500 group-hover:scale-[1.02] relative overflow-hidden group-hover:shadow-glow">
                {/* Background Elements */}
                <div
                  className={`absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 ${action.bgBlob} organic-blob opacity-50 group-hover:opacity-70 transition-opacity duration-500`}
                ></div>
                <div className="absolute bottom-0 left-0 w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

                <div className="relative z-10 space-y-6">
                  {/* Header */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="liquid-glass p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        {action.icon}
                      </div>
                      <div className="text-3xl sm:text-4xl opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                        {action.emoji}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-3 group-hover:scale-105 transition-transform duration-300">
                        {action.title}
                      </h3>
                      <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {action.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground"
                      >
                        <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <div
                      className={`liquid-glass px-4 sm:px-6 py-3 rounded-2xl bg-gradient-to-r ${action.gradient} text-white font-semibold flex items-center justify-center text-sm sm:text-base group-hover:scale-105 transition-all duration-300`}
                    >
                      <span>{action.cta}</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl"></div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionCards;
