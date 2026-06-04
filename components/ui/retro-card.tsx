import * as React from "react";
import { cn } from "@/lib/utils";

export interface RetroCardProps extends React.HTMLAttributes<HTMLDivElement> {
  // Whether to show the retro offset shadow
  hasShadow?: boolean;
  // Whether to animate the card pressing down towards the shadow on hover
  isHoverable?: boolean;
  // Shadow background color/classes (defaults to "bg-primary/10 dark:bg-primary/5")
  shadowClassName?: string;
  // Border thickness/color class (defaults to "border-2 border-slate-900 dark:border-slate-100")
  borderClassName?: string;
  // Rounded corners class (defaults to "rounded-[24px]")
  roundedClassName?: string;
  // Custom container wrapper class (e.g. width/height/etc)
  containerClassName?: string;
}

const RetroCard = React.forwardRef<HTMLDivElement, RetroCardProps>(
  (
    {
      className,
      children,
      hasShadow = true,
      isHoverable = true,
      shadowClassName = "bg-primary/10 dark:bg-primary/5",
      borderClassName = "border-2 border-slate-900 dark:border-slate-100",
      roundedClassName = "rounded-[24px]",
      containerClassName,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn("relative group/retro-card w-full flex", containerClassName)}>
        {/* Offset Shadow Layer */}
        {hasShadow && (
          <div
            className={cn(
              "absolute inset-0 translate-x-2 translate-y-2 pointer-events-none transition-transform duration-300",
              roundedClassName,
              borderClassName,
              shadowClassName,
              isHoverable && "group-hover/retro-card:translate-x-1 group-hover/retro-card:translate-y-1"
            )}
          />
        )}

        {/* Main Card Content */}
        <div
          ref={ref}
          className={cn(
            "relative flex flex-col w-full bg-background overflow-hidden transition-all duration-300",
            roundedClassName,
            borderClassName,
            isHoverable && "group-hover/retro-card:translate-x-0.5 group-hover/retro-card:translate-y-0.5",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  }
);
RetroCard.displayName = "RetroCard";

const RetroCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
RetroCardHeader.displayName = "RetroCardHeader";

const RetroCardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-black tracking-tight leading-snug", className)} {...props} />
  )
);
RetroCardTitle.displayName = "RetroCardTitle";

const RetroCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-xs md:text-sm text-muted-foreground", className)} {...props} />
  )
);
RetroCardDescription.displayName = "RetroCardDescription";

const RetroCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
RetroCardContent.displayName = "RetroCardContent";

const RetroCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0 border-t border-slate-100 dark:border-slate-900/60 mt-auto", className)} {...props} />
  )
);
RetroCardFooter.displayName = "RetroCardFooter";

export {
  RetroCard,
  RetroCardHeader,
  RetroCardTitle,
  RetroCardDescription,
  RetroCardContent,
  RetroCardFooter,
};
