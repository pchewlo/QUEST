'use client'

import { AnimatePresence, motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type WizardStep = {
  title: string
  description: string
  isComplete: boolean
  isActive: boolean
}

type PlanWizardProps = {
  steps: WizardStep[]
  children: React.ReactNode[]
  onStepClick?: (index: number) => void
}

export function PlanWizard({ steps, children, onStepClick }: PlanWizardProps) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, index) => (
        <div
          key={step.title}
          className={cn(
            "rounded-lg border border-border bg-card overflow-hidden transition-colors",
            step.isActive && "border-quest-accent/30",
          )}
        >
          {/* Step Header */}
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
              !step.isActive && "hover:bg-quest-surface-muted/50",
            )}
            onClick={() => onStepClick?.(index)}
          >
            {/* Step indicator */}
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-medium",
                step.isComplete && "bg-quest-success text-white",
                step.isActive && !step.isComplete && "bg-quest-accent text-white",
                !step.isActive && !step.isComplete && "bg-quest-surface-muted text-quest-ink-faint",
              )}
            >
              {step.isComplete ? (
                <Check size={14} strokeWidth={2} />
              ) : (
                index + 1
              )}
            </div>

            <div className="flex flex-col">
              <span
                className={cn(
                  "text-[14px] font-medium",
                  step.isActive ? "text-quest-ink" : "text-quest-ink-muted",
                )}
              >
                {step.title}
              </span>
              {!step.isActive && (
                <span className="text-[12px] text-quest-ink-faint">{step.description}</span>
              )}
            </div>
          </button>

          {/* Step Content */}
          <AnimatePresence initial={false}>
            {step.isActive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <div className="border-t border-border px-4 py-4">
                  {children[index]}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
