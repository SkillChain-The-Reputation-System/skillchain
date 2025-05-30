// Import UI components
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Toggle } from "@/components/ui/toggle"

// Import utils
import React from "react";
import { cn } from "@/lib/utils";

interface ToggleTooltipProps
  extends React.ComponentPropsWithoutRef<typeof Toggle> {
  isActive?: boolean
  tooltip?: string
}

const ToggleTooltip = React.forwardRef<HTMLButtonElement, ToggleTooltipProps>(
  ({ isActive, tooltip, children, className, ...props }, ref) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            ref={ref}
            className={cn("cursor-pointer", className,
              { "bg-accent": isActive, }
            )}
            {...props}
          >
            {children}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    );
  }
);

ToggleTooltip.displayName = "ToggleTooltip";

export default ToggleTooltip