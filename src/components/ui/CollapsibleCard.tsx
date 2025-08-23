import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardHeader, CardContent } from "./card"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./collapsible"

export interface CollapsibleCardProps extends React.ComponentPropsWithoutRef<typeof Collapsible> {
  title: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function CollapsibleCard({
  title,
  children,
  className,
  ...props
}: CollapsibleCardProps) {
  return (
    <Collapsible {...props}>
      <Card className={cn("border-[hsl(var(--earthy-brown))]", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-[hsl(var(--sage-green)/0.15)]">
          <span className="font-medium text-[hsl(var(--earthy-brown))]">{title}</span>
          <CollapsibleTrigger asChild>
            <button className="ml-auto text-[hsl(var(--earthy-brown))] [&[data-state=open]>svg]:rotate-180">
              <ChevronDown className="h-4 w-4 transition-transform" />
            </button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="bg-[hsl(var(--moss-green)/0.1)]">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default CollapsibleCard
