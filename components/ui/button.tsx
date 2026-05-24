import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border border-red-300/20 bg-gradient-to-b from-red-800/90 via-red-950/92 to-zinc-950 text-stone-50 shadow-sm shadow-black/30 hover:from-red-700/90 hover:via-red-900/92 hover:to-zinc-950",
        destructive:
          "border border-red-300/30 bg-gradient-to-b from-red-700/95 via-red-950 to-black text-stone-50 shadow-sm shadow-black/35 hover:from-red-600/95 hover:via-red-900 hover:to-black focus-visible:ring-red-400/35 dark:focus-visible:ring-red-400/35",
        outline:
          "border border-red-300/20 bg-gradient-to-b from-zinc-900/90 via-red-950/72 to-black text-stone-50 shadow-xs hover:from-red-950/85 hover:to-zinc-950 dark:bg-input/30 dark:border-red-300/20 dark:hover:bg-input/50",
        secondary:
          "border border-amber-200/14 bg-gradient-to-b from-zinc-800/92 via-red-950/78 to-black text-stone-100 shadow-sm shadow-black/25 hover:from-red-900/88 hover:via-red-950/86 hover:to-black",
        ghost:
          "text-stone-100 hover:bg-red-950/45 hover:text-stone-50 dark:hover:bg-red-950/45",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
