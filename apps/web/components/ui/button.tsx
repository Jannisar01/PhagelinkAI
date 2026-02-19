import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-white hover:bg-slate-800 px-4 py-2"
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, ...props }, ref) => (
  <button className={cn(buttonVariants(), className)} ref={ref} {...props} />
));
Button.displayName = "Button";

export { Button };
