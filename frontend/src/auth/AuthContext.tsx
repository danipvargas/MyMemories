import type { ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  registerUser as registerRequest,
} from "@/lib/api"
import { AuthContext, type RegisterPayload } from "@/auth/auth-context"

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const userQuery = useQuery({
    queryKey: ["auth-user"],
    queryFn: getCurrentUser,
    retry: false,
  })

  const login = async (identifier: string, password: string) => {
    const user = await loginRequest(identifier, password)
    queryClient.setQueryData(["auth-user"], user)
    return user
  }

  const register = async (payload: RegisterPayload) => {
    const user = await registerRequest(payload)
    return user
  }

  const logout = async () => {
    await logoutRequest()
    queryClient.setQueryData(["auth-user"], null)
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== "auth-user" })
  }

  return (
    <AuthContext.Provider
      value={{
        user: userQuery.data ?? null,
        isLoading: userQuery.isPending,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
