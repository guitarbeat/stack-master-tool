import { ReactNode } from 'react';

interface SectionCTAProps {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}

export const SectionCTA = ({
  title,
  description,
  children,
  className = ""
}: SectionCTAProps) => (
  <div className={`text-center mt-12 sm:mt-16 ${className}`}>
    <div className="liquid-glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto">
      <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground text-sm sm:text-base mb-6">
        {description}
      </p>
      {children}
    </div>
  </div>
);

export default SectionCTA;
