"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth } from "@/hooks/use-auth"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
  securityQuestion: string
  securityAnswer: string
}

interface ForgotPasswordForm {
  email: string
  securityAnswer: string
  newPassword: string
  confirmNewPassword: string
}

const securityQuestions = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What was the name of your elementary school?",
  "What is your favorite movie?",
  "What was your childhood nickname?",
  "What is the name of your best friend?",
  "What was your first car?",
]


export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState("login")
  const [userSecurityQuestion, setUserSecurityQuestion] = useState<string>("")
  const [showSecurityQuestion, setShowSecurityQuestion] = useState(false)
  const { login, register, resetPasswordWithSecurity } = useAuth()

  const loginForm = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const registerForm = useForm<RegisterForm>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      securityQuestion: "",
      securityAnswer: "",
    },
  })

  const forgotPasswordForm = useForm<ForgotPasswordForm>({
    defaultValues: {
      email: "",
      securityAnswer: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  })

  const checkUserSecurityQuestion = async (email: string) => {
    if (!email) return

    try {
      // This would need a new API endpoint to get security question by email
      // For now, we'll show the security question input directly
      setShowSecurityQuestion(true)
      setUserSecurityQuestion("Please enter your security answer below")
    } catch (error) {
      setShowSecurityQuestion(false)
    }
  }

  const onLogin = async (data: LoginForm) => {
    setIsLoading(true)
    const success = await login(data.email, data.password)
    setIsLoading(false)

    if (success) {
      onClose()
      onSuccess()
    }
  }

  const onRegister = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      registerForm.setError("confirmPassword", {
        message: "Passwords do not match",
      })
      return
    }

    setIsLoading(true)
    const success = await register(data.name, data.email, data.password, data.securityQuestion, data.securityAnswer)
    setIsLoading(false)

    if (success) {
      onClose()
      onSuccess()
    }
  }

  const onForgotPassword = async (data: ForgotPasswordForm) => {
    if (data.newPassword !== data.confirmNewPassword) {
      forgotPasswordForm.setError("confirmNewPassword", {
        message: "Passwords do not match",
      })
      return
    }

    setIsLoading(true)
    const success = await resetPasswordWithSecurity(data.email, data.securityAnswer, data.newPassword)
    setIsLoading(false)

    if (success) {
      setCurrentTab("login")
      forgotPasswordForm.reset()
      setShowSecurityQuestion(false)
      setUserSecurityQuestion("")
    } else {
      forgotPasswordForm.setError("securityAnswer", {
        message: "Security answer is incorrect. Please try again.",
      })
    }
  }

  const clearLoginForm = () => {
    loginForm.reset()
  }

  const clearRegisterForm = () => {
    registerForm.reset()
  }

  const clearForgotPasswordForm = () => {
    forgotPasswordForm.reset()
    setShowSecurityQuestion(false)
    setUserSecurityQuestion("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Welcome to TaskMaster Pro</DialogTitle>
          <DialogDescription>Sign in to your account or create a new one to get started.</DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="forgot">Forgot</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  {...loginForm.register("email", { required: "Email is required" })}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  {...loginForm.register("password", { required: "Password is required" })}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="button" variant="outline" onClick={clearLoginForm}>
                  Clear
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? <LoadingSpinner size="sm" /> : "Login"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    placeholder="Enter your full name"
                    {...registerForm.register("name", { required: "Name is required" })}
                  />
                  {registerForm.formState.errors.name && (
                    <p className="text-sm text-red-600">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    {...registerForm.register("email", { required: "Email is required" })}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="Create a password"
                    {...registerForm.register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Password must be at least 6 characters" },
                    })}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirm Password</Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    {...registerForm.register("confirmPassword", { required: "Please confirm your password" })}
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="security-question">Security Question</Label>
                  <Select
                    value={registerForm.watch("securityQuestion")}
                    onValueChange={(value) => registerForm.setValue("securityQuestion", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a security question" />
                    </SelectTrigger>
                    <SelectContent>
                      {securityQuestions.map((question) => (
                        <SelectItem key={question} value={question}>
                          {question}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {registerForm.formState.errors.securityQuestion && (
                    <p className="text-sm text-red-600">{registerForm.formState.errors.securityQuestion.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="security-answer">Security Answer</Label>
                  <Input
                    id="security-answer"
                    placeholder="Enter your answer"
                    {...registerForm.register("securityAnswer", { required: "Security answer is required" })}
                  />
                  {registerForm.formState.errors.securityAnswer && (
                    <p className="text-sm text-red-600">{registerForm.formState.errors.securityAnswer.message}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="button" variant="outline" onClick={clearRegisterForm}>
                    Clear
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? <LoadingSpinner size="sm" /> : "Create Account"}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="forgot" className="space-y-4 mt-4">
            <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPassword)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email"
                  {...forgotPasswordForm.register("email", { required: "Email is required" })}
                  onBlur={(e) => checkUserSecurityQuestion(e.target.value)}
                />
                {forgotPasswordForm.formState.errors.email && (
                  <p className="text-sm text-red-600">{forgotPasswordForm.formState.errors.email.message}</p>
                )}
              </div>

              {showSecurityQuestion && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Security Question</Label>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                      Please provide your security answer for password reset
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="forgot-security-answer">Your Answer</Label>
                    <Input
                      id="forgot-security-answer"
                      placeholder="Enter your answer"
                      {...forgotPasswordForm.register("securityAnswer", { required: "Security answer is required" })}
                    />
                    {forgotPasswordForm.formState.errors.securityAnswer && (
                      <p className="text-sm text-red-600">
                        {forgotPasswordForm.formState.errors.securityAnswer.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="forgot-new-password">New Password</Label>
                    <Input
                      id="forgot-new-password"
                      type="password"
                      placeholder="Enter new password"
                      {...forgotPasswordForm.register("newPassword", {
                        required: "New password is required",
                        minLength: { value: 6, message: "Password must be at least 6 characters" },
                      })}
                    />
                    {forgotPasswordForm.formState.errors.newPassword && (
                      <p className="text-sm text-red-600">{forgotPasswordForm.formState.errors.newPassword.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="forgot-confirm-new-password">Confirm New Password</Label>
                    <Input
                      id="forgot-confirm-new-password"
                      type="password"
                      placeholder="Confirm new password"
                      {...forgotPasswordForm.register("confirmNewPassword", {
                        required: "Please confirm your new password",
                      })}
                    />
                    {forgotPasswordForm.formState.errors.confirmNewPassword && (
                      <p className="text-sm text-red-600">
                        {forgotPasswordForm.formState.errors.confirmNewPassword.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="button" variant="outline" onClick={clearForgotPasswordForm}>
                  Clear
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading || !showSecurityQuestion}>
                  {isLoading ? <LoadingSpinner size="sm" /> : "Reset Password"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
