import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Typography({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("prose dark:prose-invert", className)} {...props} />
  );
}

export default Typography;
