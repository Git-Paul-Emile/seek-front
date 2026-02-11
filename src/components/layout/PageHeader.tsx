import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  iconClassName,
  action,
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", className)}>
      <div>
        <div className="flex items-center gap-2 text-primary mb-1">
          {Icon && (
            <Icon className={cn("w-4 h-4", iconClassName)} />
          )}
          <span className="text-sm font-semibold uppercase tracking-wider font-body">{title}</span>
        </div>
        {children && (
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{children}</h1>
        )}
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
      {action && <div className="self-start">{action}</div>}
    </div>
  );
};

export default PageHeader;
