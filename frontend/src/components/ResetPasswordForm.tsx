"use client"

import * as React from "react"
import { useForm, ControllerRenderProps } from "react-hook-form" // ✅ Import ControllerRenderProps
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

// 👇 SỬ DỤNG HOOK USEAUTH (Thay vì fetch trực tiếp)
import { useAuth } from "@/features/auth"

// ============================================
// STEP 1: Request reset password email
// ============================================
const requestResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type RequestResetFormValues = z.infer<typeof requestResetSchema>

// ============================================
// STEP 2: Reset password with token
// ============================================
const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

// ============================================
// Main Component
// ============================================
export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")

  // ✅ Lấy các hàm từ useAuth (đã được fix ở bước trước)
  const { forgotPassword, resetPassword, isLoading } = useAuth()

  const [emailSent, setEmailSent] = React.useState(false)
  const [resetSuccess, setResetSuccess] = React.useState(false)

  // Form 1: Request Email
  const requestForm = useForm<RequestResetFormValues>({
    resolver: zodResolver(requestResetSchema),
    defaultValues: { email: "" },
  })

  // Form 2: Reset Password
  const resetForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  // 🔵 XỬ LÝ BƯỚC 1: Gửi yêu cầu reset
  const onRequestReset = async (data: RequestResetFormValues) => {
    try {
      // Gọi qua Hook thay vì fetch thủ công
      const res = await forgotPassword(data.email)
      if (res?.success) {
        setEmailSent(true)
      }
    } catch (error) {
      console.error("Request failed", error)
    }
  }

  // 🔵 XỬ LÝ BƯỚC 2: Đổi mật khẩu mới
  const onResetPassword = async (data: ResetPasswordFormValues) => {
    if (!token) return

    try {
      // Gọi qua Hook thay vì fetch thủ công
      const res = await resetPassword({
        token,
        newPassword: data.password,
      })
      
      if (res?.success) {
        setResetSuccess(true)
        setTimeout(() => router.push("/login"), 3000)
      }
    } catch (error) {
      console.error("Reset failed", error)
    }
  }

  // --------------------------------------------------------
  // UI RENDER LOGIC
  // --------------------------------------------------------

  // 1. Màn hình báo thành công
  if (resetSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Password Reset Successful!</CardTitle>
            <CardDescription>
              Your password has been reset. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // 2. Màn hình báo đã gửi Email (khi chưa có token)
  if (emailSent && !token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent you a password reset link. Please check your inbox.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Didn&apos;t receive it?{" "}
                <button
                  onClick={() => setEmailSent(false)}
                  className="font-medium text-primary underline hover:underline"
                >
                  try again
                </button>
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Link href="/login" className="text-sm text-primary hover:underline">
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 3. Màn hình Form đổi mật khẩu (KHI CÓ TOKEN)
  if (token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="password"
                  render={({ field }: { field: ControllerRenderProps<ResetPasswordFormValues, "password"> }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetForm.control}
                  name="confirmPassword"
                  render={({ field }: { field: ControllerRenderProps<ResetPasswordFormValues, "confirmPassword"> }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 4. Màn hình Mặc định: Nhập Email để yêu cầu reset
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>Enter your email to receive a reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...requestForm}>
            <form onSubmit={requestForm.handleSubmit(onRequestReset)} className="space-y-4">
              <FormField
                control={requestForm.control}
                name="email"
                render={({ field }: { field: ControllerRenderProps<RequestResetFormValues, "email"> }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <div className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline">
                  Back to Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}