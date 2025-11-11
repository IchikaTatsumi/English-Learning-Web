"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth"

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

//  Schema xác thực bằng Zod
const signupSchema = z
  .object({
    fullName: z.string().min(1, { message: "Full name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    username: z.string().min(3, { message: "Username must be at least 3 characters" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (data: SignupFormValues) => {
    console.log('🔵 [SIGNUP] Starting registration process...');
    console.log('🔵 [SIGNUP] Data:', data);
    
    try {
      // ✅ Call register API
      console.log('🔵 [SIGNUP] Calling register API...');
      await register({
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        password: data.password,
      });
      
      console.log('✅ [SIGNUP] Registration successful!');
      console.log('✅ [SIGNUP] Redirecting to /login...');
      
      // ✅ Redirect to login page after successful registration
      router.push('/login');
      
      console.log('✅ [SIGNUP] Router.push called');
    } catch (error) {
      console.error('❌ [SIGNUP] Registration error:', error);
      // Error toast is already shown by auth hook
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormDescription>Enter your full name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} />
                  </FormControl>
                  <FormDescription>We'll use this to contact you.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe" {...field} />
                  </FormControl>
                  <FormDescription>Must be unique.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormDescription>Must be at least 6 characters.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormDescription>Please confirm your password.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <div className="pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Already have an account?{" "}
                <a href="/login" className="text-primary hover:underline">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}