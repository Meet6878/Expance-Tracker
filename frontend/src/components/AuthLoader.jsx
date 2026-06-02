import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoader({ children }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return <>{children}</>;
}
