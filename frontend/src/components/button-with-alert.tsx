import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

// Import utils
import React from "react";
import { cn } from "@/lib/utils";

interface ButtonWithAlertProps
  extends React.ComponentPropsWithoutRef<typeof Button> {
  dialogTitle?: string,
  dialogDescription?: string
  continueAction?: () => void
}

const ButtonWithAlert = React.forwardRef<HTMLButtonElement, ButtonWithAlertProps>(
  ({ dialogTitle, dialogDescription, continueAction, children, className, ...props }, ref) => {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            ref={ref}
            className={cn("cursor-pointer", className)}
            {...props}
          >
            {children}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>

          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">{dialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-zinc-700 hover:bg-zinc-700/60 text-white dark:bg-slate-200 dark:text-black dark:hover:bg-slate-200/60"
              onClick={continueAction}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    )
  }
)

ButtonWithAlert.displayName = "ButtonWithAlert";

export default ButtonWithAlert