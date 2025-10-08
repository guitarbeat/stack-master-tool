import { Link } from "react-router-dom";
import {
  QrCode,
  ArrowRight,
  Users,
  Sparkles,
  CheckCircle,
  Eye,
} from "lucide-react";
export const ActionCards = () => {
  const actions = [
    {
      to: "/meeting?mode=host",
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "HOST a Meeting",
      description:
        "Full facilitator controls with manual stack management and remote access capabilities. Create meetings, manage participants, and control the speaking queue.",
      cta: "Start Hosting",
      emoji: "🎯",
      gradient: "from-primary to-accent",
      bgBlob: "bg-primary/10",
      features: [
        "Manual stack management",
        "Enable remote access",
        "Full facilitator controls",
        "Real-time participant management",
        "Speaking analytics & distribution",
      ],
      isPrimary: true,
    },
    {
      to: "/meeting?mode=join",
      icon: <QrCode className="w-6 h-6 text-accent" />,
      title: "JOIN a Meeting",
      description:
        "Enter a meeting code to participate in an active discussion and join the speaking queue.",
      cta: "Join Meeting",
      emoji: "🌿",
      gradient: "from-accent to-accent/80",
      bgBlob: "bg-accent/10",
      features: [
        "Enter meeting code",
        "Join active discussion",
        "Raise your hand to speak",
      ],
      isPrimary: false,
    },
    {
      to: "/meeting?mode=watch",
      icon: <Eye className="w-6 h-6 text-primary" />,
      title: "WATCH a Meeting",
      description:
        "Observe a meeting in read-only mode. Perfect for stakeholders, observers, and display screens.",
      cta: "Watch Meeting",
      emoji: "👁️",
      gradient: "from-primary to-primary/80",
      bgBlob: "bg-primary/10",
      features: [
        "Enter meeting code",
        "Read-only viewing",
        "No participation needed",
        "Display-optimized layout",
        "Speaking analytics visible",
      ],
      isPrimary: false,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base mb-4">
          <Sparkles className="w-4 h-4" />
          <span>Three-Mode Architecture</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-4">
          Choose Your
          <span className="text-primary"> Role</span>
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
          Inspired by jparty.tv's approach, our platform offers three distinct ways to participate in democratic discussions. 
          Whether you're facilitating, participating, or observing, there's a mode designed for your needs.
        </p>
      </div>

      {/* Primary HOST Card */}
      <div className="mb-8">
        {actions.filter(action => action.isPrimary).map((action, index) => (
          <div key={index} className="group">
            <Link to={action.to} className="block h-full">
              <div className="liquid-glass rounded-2xl sm:rounded-3xl p-8 sm:p-12 h-full transition-all duration-500 group-hover:scale-[1.02] relative overflow-hidden group-hover:shadow-glow">
                {/* Background Elements */}
                <div
                  className={`absolute top-0 right-0 w-32 sm:w-40 h-32 sm:h-40 ${action.bgBlob} organic-blob opacity-50 group-hover:opacity-70 transition-opacity duration-500`}
                ></div>
                <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>

                <div className="relative z-10 space-y-8">
                  {/* Header */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="liquid-glass p-6 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                        {action.icon}
                      </div>
                      <div className="text-4xl sm:text-5xl opacity-20 group-hover:opacity-40 transition-opacity duration-300">
                        {action.emoji}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-3xl sm:text-4xl font-bold gradient-text mb-4 group-hover:scale-105 transition-transform duration-300">
                        {action.title}
                      </h3>
                      <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {action.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-3 text-sm sm:text-base text-muted-foreground"
                      >
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-4">
                    <div
                      className={`liquid-glass px-8 sm:px-12 py-4 sm:py-6 rounded-2xl bg-gradient-to-r ${action.gradient} text-white font-semibold flex items-center justify-center text-lg sm:text-xl group-hover:scale-105 transition-all duration-300`}
                    >
                      <span>{action.cta}</span>
                      <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

      {/* Secondary Cards */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {actions.filter(action => !action.isPrimary).map((action, index) => (
          <div key={index} className="group">
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
