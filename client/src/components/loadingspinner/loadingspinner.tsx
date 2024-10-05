import * as React from "react";
import { cn } from "@/lib/utils";

const spinnerVariants =
  "w-16 h-16 border-4 border-t-4 border-black border-t-black rounded-full animate-spin";

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>((props, ref) => {
  const { className, ...rest } = props;
  return <div ref={ref} className={cn(spinnerVariants, className)} {...rest} />;
});

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };