import { createContext } from "react"

import type { User } from "@/lib/api"

export type RegisterPayload = {
  username: string
  email: string
  password: string
  profileImage?: File
}

export type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
