"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

const BubbleTooltipProvider = TooltipPrimitive.Provider;

const BubbleTooltip = TooltipPrimitive.Root;

const BubbleTooltipTrigger = TooltipPrimitive.Trigger;

const BubbleTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-visible rounded-md border-2 border-black bg-white px-4 py-2.5 text-sm text-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative",
      "after:content-[''] after:absolute after:bottom-[-8px] after:left-1/2 after:transform after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-black",
      "before:content-[''] before:absolute before:bottom-[-6px] before:left-1/2 before:transform before:-translate-x-1/2 before:border-[7px] before:border-transparent before:border-t-white",
      className
    )}
    {...props}
  />
));
BubbleTooltipContent.displayName = TooltipPrimitive.Content.displayName;

export {
  BubbleTooltip,
  BubbleTooltipTrigger,
  BubbleTooltipContent,
  BubbleTooltipProvider,
};
