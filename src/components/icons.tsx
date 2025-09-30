import { Satellite } from 'lucide-react';

export const Logo = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-2 text-primary-foreground ${className}`}>
    <Satellite className="h-6 w-6" />
    <span className="text-lg font-semibold">Cryo-Scope</span>
  </div>
);
