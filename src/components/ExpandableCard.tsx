import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ExpandableCardProps {
  title: ReactNode;
  summary?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const ExpandableCard = ({ title, summary, children, className }: ExpandableCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle>{title}</CardTitle>
            {summary && <CardDescription>{summary}</CardDescription>}
          </div>
          <CollapsibleTrigger asChild>
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <ChevronDown className={cn("h-4 w-4 transition-transform", open ? "rotate-180" : "")} />
              <span className="sr-only">Toggle</span>
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>{children}</CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
