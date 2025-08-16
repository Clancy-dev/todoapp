// API client for authentication endpoints
const API_BASE_URL = process.env.NODE_ENV === "production" ? "https://taskmasterpro1.vercel.app/" : "http://localhost:3000"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  user?: any
  error?: string
}

class AuthApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/auth`
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()
      return data
    } catch (error) {
      console.error("API request failed:", error)
      return { success: false, error: "Network error" }
    }
  }

  async login(email: string, password: string) {
    return this.request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  }

  async register(
    name: string,
    email: string,
    password: string,
    securityQuestion: string,
    securityAnswer: string,
    profilePicture?: string | null,
  ) {
    return this.request("/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
        securityQuestion,
        securityAnswer,
        profilePicture,
      }),
    })
  }

  async getMe(userId: string) {
    return this.request("/me", {
      method: "GET",
      headers: {
        "x-user-id": userId,
      },
    })
  }

  async updateProfile(userId: string, updates: any) {
    return this.request("/profile", {
      method: "PUT",
      headers: {
        "x-user-id": userId,
      },
      body: JSON.stringify(updates),
    })
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return this.request("/change-password", {
      method: "PUT",
      headers: {
        "x-user-id": userId,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async resetPassword(email: string, securityAnswer: string, newPassword: string) {
    return this.request("/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, securityAnswer, newPassword }),
    })
  }
}

export const authApi = new AuthApiClient()
