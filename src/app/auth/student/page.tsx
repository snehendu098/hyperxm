"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { studentLogin } from "@/lib/api"

export default function StudentLoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isNewUser, setIsNewUser] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    account: "",
    uniId: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // For new users, we need to include the university ID
      const payload = isNewUser ? { account: formData.account, uniId: formData.uniId } : { account: formData.account }

      const response = await studentLogin(payload.account, isNewUser ? payload.uniId : undefined)

      if (response.success) {
        // Store user data in localStorage or context
        localStorage.setItem("userAccount", formData.account)
        localStorage.setItem("userType", "student")
        localStorage.setItem("userData", JSON.stringify(response.data))

        toast({
          title: "Login successful",
          description: "Welcome to BlockExam",
        })

        router.push("/dashboard/student")
      } else {
        throw new Error(response.message || "Authentication failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Back to home</span>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Student Login</h1>
          <p className="text-sm text-muted-foreground">Enter your blockchain account to sign in</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>{isNewUser ? "Create a new account" : "Sign in to your account"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account">Blockchain Account</Label>
                <Input id="account" placeholder="0x..." required value={formData.account} onChange={handleChange} />
              </div>
              {isNewUser && (
                <div className="space-y-2">
                  <Label htmlFor="uniId">University ID</Label>
                  <Input
                    id="uniId"
                    placeholder="Enter your university ID"
                    required={isNewUser}
                    value={formData.uniId}
                    onChange={handleChange}
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : isNewUser ? "Register" : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsNewUser(!isNewUser)}
                disabled={isLoading}
              >
                {isNewUser ? "Already have an account?" : "New user? Register here"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

