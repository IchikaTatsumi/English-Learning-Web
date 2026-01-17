"use client"

import * as React from "react"
import { useForm, ControllerRenderProps } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/features/auth" // Đảm bảo import đúng hook
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
import { Role } from "@/lib/constants/enums" // Enum Role nếu có

const loginSchema = z.object({
  usernameOrEmail: z.string().min(3, "Username or email must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading } = useAuth()
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      console.log("🚀 Submitting Login...");
      const result = await login({
        usernameOrEmail: data.usernameOrEmail,
        password: data.password,
      });
      
      // Hook login thường trả về kết quả sau khi đã gọi service
      // Nếu service đã lưu token, ở đây chỉ cần điều hướng
      if (result.success && result.data) {
        console.log("✅ Login success, redirecting...");
        
        // Hỗ trợ check role linh hoạt
        const userData = result.data.user as any;
        const userRole = userData.role || userData.role_id;
        
        const returnUrl = searchParams?.get('returnUrl');
        
        if (returnUrl) {
          router.push(decodeURIComponent(returnUrl));
        } else {
          // Điều hướng mặc định dựa trên Role
          // Đảm bảo so sánh string/enum chuẩn xác
          if (String(userRole).toLowerCase() === 'admin') {
            router.push('/dashboard/home');
          } else {
            router.push('/main/home');
          }
        }
      } else {
        console.warn("⚠️ Login returned success=false", result);
      }
    } catch (error) {
      console.error('❌ [LOGIN FORM] Error:', error);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your information below to login to your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="usernameOrEmail"
                render={({ field }: { field: ControllerRenderProps<LoginFormValues, "usernameOrEmail"> }) => (
                  <FormItem>
                    <FormLabel>Username or Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username or email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }: { field: ControllerRenderProps<LoginFormValues, "password"> }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/reset-password"
                        className="text-sm text-primary underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline">
                  Sign up
                </Link>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}