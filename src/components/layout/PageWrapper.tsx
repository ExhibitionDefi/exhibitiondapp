import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children:   React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function PageWrapper({
  children,
  className,
  fullWidth = false,
}: PageWrapperProps) {
  return (
    <main className={cn(
      'min-h-[calc(100vh-4rem-3.5rem)]', // viewport minus navbar(4rem) and footer(3.5rem)
      'w-full px-4 py-8 md:px-6 md:py-10',
      !fullWidth && 'mx-auto max-w-7xl',
      className
    )}>
      {children}
    </main>
  );
}