import { cn } from "@/lib/utils"

/**
 * Standard page wrapper: centered, responsive max-width, consistent padding.
 * `size` controls the max width for different page densities.
 */
export function PageContainer({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "sm" | "default" | "lg" | "full"
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 sm:py-8",
        size === "sm" && "max-w-xl",
        size === "default" && "max-w-4xl",
        size === "lg" && "max-w-7xl",
        size === "full" && "max-w-none",
        className
      )}
      {...props}
    />
  )
}
