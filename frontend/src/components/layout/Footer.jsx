import { IndianRupee } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
              <IndianRupee className="h-3 w-3" />
            </div>
            <span>ExpenseTracker</span>
          </div>
          <Separator className="sm:hidden" />
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ExpenseTracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
