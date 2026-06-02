import { useQuery } from "@tanstack/react-query";
import { useAppDispatch } from "@/store";
import { setUser, clearUser } from "@/store/slices/authSlice";
import { authApi } from "@/api/auth.api";
import { useEffect } from "react";

export function useAuth() {
  const dispatch = useAppDispatch();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: authApi.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data?.user) {
      dispatch(setUser(data.user));
    }
    if (isError) {
      dispatch(clearUser());
    }
  }, [data, isError, dispatch]);

  return { isLoading, isAuthenticated: !!data?.user };
}
