"use client"

import React from "react"
import TumboNavbar from "./tumbo-navbar"
import { cn } from "@/lib/utils"

interface ModernPageLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
  className?: string
}

const ModernPageLayout = React.forwardRef<
  HTMLDivElement,
  ModernPageLayoutProps
>(function ModernPageLayout(
  { children, className, ...otherProps }: ModernPageLayoutProps,
  ref
) {
  return (
    <div
      className={cn(
        "flex h-screen w-full flex-col items-center overflow-x-hidden",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <TumboNavbar />
      {children ? (
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 overflow-y-auto overflow-x-hidden bg-default-background" style={{ overscrollBehaviorX: "none" }}>
          <div style={{ width: "100%", maxWidth: "min(1600px, calc(100% - 48px))", margin: "0 auto" }}>
            {children}
          </div>
        </div>
      ) : null}
    </div>
  )
})

export { ModernPageLayout }



