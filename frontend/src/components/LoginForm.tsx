"use client"

import * as React from "react"
import { useForm, ControllerRenderProps } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth"

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

// ✅ Schema kiểm tra dữ liệu - hỗ trợ cả username và email
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
  const { login, isLoading } = useAuth()
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    console.log('🔵 [LOGIN] Starting login process...');
    console.log('🔵 [LOGIN] Data:', data);
    
    try {
      // ✅ Call login API với usernameOrEmail
      console.log('🔵 [LOGIN] Calling login API...');
      const result = await login({
        usernameOrEmail: data.usernameOrEmail,
        password: data.password,
      });
      
      console.log('✅ [LOGIN] Login successful!', result);
      console.log('✅ [LOGIN] Redirecting to /dashboard/home...');
      
      // ✅ Redirect to dashboard after successful login
      router.push('/dashboard/home');
      
      console.log('✅ [LOGIN] Router.push called');
    } catch (error) {
      console.error('❌ [LOGIN] Login error:', error);
      // Error toast is already shown by auth hook
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
                      <a
                        href="#"
                        className="text-sm text-primary underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </a>
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
                <a href="/signup" className="underline">
                  Sign up
                </a>
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}