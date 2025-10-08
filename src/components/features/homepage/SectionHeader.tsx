import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon?: LucideIcon;
  badge?: string;
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

export const SectionHeader = ({
  icon: Icon,
  badge,
  title,
  subtitle,
  description,
  className = ""
}: SectionHeaderProps) => (
  <div className={`text-center mb-12 sm:mb-16 ${className}`}>
    {/* Badge */}
    {badge && (
      <div className="inline-flex items-center gap-2 text-primary font-semibold text-sm sm:text-base mb-4">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{badge}</span>
      </div>
    )}

    {/* Title */}
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text mb-4">
      {subtitle ? (
        <>
          {title}
          <span className="text-primary"> {subtitle}</span>
        </>
      ) : (
        title
      )}
    </h2>

    {/* Description */}
    {description && (
      <p className="text-muted-foreground text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
    )}
  </div>
);

export default SectionHeader;

// Re-export SectionCTA for convenience
export { SectionCTA } from './SectionCTA';
