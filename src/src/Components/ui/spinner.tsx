import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<typeof Loader2>) {
  return (
    <Loader2
      role="status"
      aria-label="Loading"
      className={cn("size-5 animate-spin text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Spinner }
