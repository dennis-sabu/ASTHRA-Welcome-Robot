import * as React from "react"

type ButtonVariant = "default" | "outline" | "secondary" | "ghost" | "destructive" | "link"
type ButtonSize = "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/80",
  outline:
    "border border-border bg-background hover:bg-muted hover:text-foreground",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  ghost:
    "hover:bg-muted hover:text-foreground",
  destructive:
    "bg-destructive/10 text-destructive hover:bg-destructive/20",
  link: "text-primary underline-offset-4 hover:underline",
}

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-8 gap-1.5 px-2.5",
  xs: "h-6 gap-1 rounded-md px-2 text-xs",
  sm: "h-7 gap-1 rounded-md px-2.5 text-sm",
  lg: "h-9 gap-1.5 px-2.5",
  icon: "size-8",
  "icon-xs": "size-6 rounded-md",
  "icon-sm": "size-7 rounded-md",
  "icon-lg": "size-9",
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
}

export { Button }
export type { ButtonProps }
