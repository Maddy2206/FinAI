import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border-2 border-ink px-2.5 py-0.5 font-sans text-[11px] font-bold whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:ring-marigold/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-orange text-cream [a]:hover:bg-orange/90",
        secondary: "bg-marigold text-ink [a]:hover:bg-marigold/90",
        destructive: "bg-danger text-cream [a]:hover:bg-danger/90",
        outline: "bg-cream text-ink [a]:hover:bg-ink/5",
        ghost: "border-transparent text-ink hover:bg-ink/5",
        link: "border-transparent text-orange underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
