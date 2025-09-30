import { SidebarTrigger } from '@/components/ui/sidebar';

type PageHeaderProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
      <div className="grid gap-1">
        <div className="flex items-center gap-2">
           <div className="md:hidden">
            <SidebarTrigger />
           </div>
           <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        </div>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}
