"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Settings, Trophy, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useToast } from "@/hooks/use-toast"
import { listExams } from "@/lib/api"

export default function StudentDashboard() {
  const { toast } = useToast()
  const [userData, setUserData] = useState<any>(null)
  const [uniExams, setUniExams] = useState<any[]>([])
  const [otherExams, setOtherExams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load user data from localStorage
    const storedUserData = localStorage.getItem("userData")
    const userAccount = localStorage.getItem("userAccount")

    if (storedUserData && userAccount) {
      try {
        const parsedData = JSON.parse(storedUserData)
        setUserData(parsedData)

        // Set exams from stored data initially
        if (parsedData.uniExams) setUniExams(parsedData.uniExams)
        if (parsedData.otherExams) setOtherExams(parsedData.otherExams)

        // Then fetch fresh data
        fetchExams(userAccount)
      } catch (error) {
        console.error("Error parsing user data:", error)
        toast({
          title: "Error loading data",
          description: "Please try logging in again",
          variant: "destructive",
        })
      }
    } else {
      // Redirect to login if no user data
      window.location.href = "/auth/student"
    }
  }, [toast])

  const fetchExams = async (account: string) => {
    try {
      setIsLoading(true)

      // Get university exams
      const uniResponse = await listExams({
        university: account,
        limit: 10,
      })

      if (uniResponse.success) {
        setUniExams(uniResponse.data.exams)
      }

      // Get public exams from other universities
      const publicResponse = await listExams({
        public: true,
        limit: 10,
      })

      if (publicResponse.success) {
        setOtherExams(publicResponse.data.exams)
      }
    } catch (error) {
      console.error("Error fetching exams:", error)
      toast({
        title: "Failed to load exams",
        description: "Please check your connection and try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userAccount")
    localStorage.removeItem("userType")
    localStorage.removeItem("userData")
    window.location.href = "/"
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader className="flex h-14 items-center border-b px-4">
            <div className="flex items-center gap-2 font-bold">
              <div className="rounded-full bg-primary p-1 text-primary-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span>BlockExam</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <Link href="/dashboard/student">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/student/exams">
                    <BookOpen className="h-4 w-4" />
                    <span>Exams</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/student/profile">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/student/achievements">
                    <Trophy className="h-4 w-4" />
                    <span>Achievements</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/student/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px]">
            <SidebarTrigger />
            <div className="w-full flex-1">
              <h1 className="text-xl font-semibold">Student Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                {localStorage.getItem("userAccount")?.substring(0, 6)}...
              </Button>
            </div>
          </header>
          <main className="flex-1 space-y-4 p-4 md:p-8">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userData?.exams || 0}</div>
                  <p className="text-xs text-muted-foreground">{userData?.attendedExams || 0} completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userData?.avgScore ? `${userData.avgScore}%` : "N/A"}</div>
                  <Progress value={userData?.avgScore || 0} className="mt-2" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Skill XP</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userData?.totalXP || 0} XP</div>
                  <p className="text-xs text-muted-foreground">Across all skill categories</p>
                </CardContent>
              </Card>
            </div>
            <Tabs defaultValue="university">
              <div className="flex items-center justify-between">
                <TabsList className="mb-4">
                  <TabsTrigger value="university">University Exams</TabsTrigger>
                  <TabsTrigger value="public">Public Exams</TabsTrigger>
                </TabsList>
                <Link href="/dashboard/student/exams">
                  <Button size="sm">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse All Exams
                  </Button>
                </Link>
              </div>
              <TabsContent value="university" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : uniExams.length > 0 ? (
                  uniExams.map((exam) => (
                    <Card key={exam.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{exam.title}</CardTitle>
                        <CardDescription>{exam.university || "Your University"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium">Duration:</span>
                            <span className="ml-2">{exam.duration} minutes</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Questions:</span>
                            <span className="ml-2">{exam.totalQuestions}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Created:</span>
                            <span className="ml-2">{formatDate(exam.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <div className="flex justify-end p-4 pt-0">
                        <Link href={`/exam/${exam.id}`}>
                          <Button>Take Exam</Button>
                        </Link>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <p className="mb-2 text-center text-muted-foreground">No university exams available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="public" className="space-y-4">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : otherExams.length > 0 ? (
                  otherExams.map((exam) => (
                    <Card key={exam.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{exam.title}</CardTitle>
                        <CardDescription>{exam.university || "Public Exam"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col space-y-2 text-sm">
                          <div className="flex items-center">
                            <span className="font-medium">Duration:</span>
                            <span className="ml-2">{exam.duration} minutes</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Questions:</span>
                            <span className="ml-2">{exam.totalQuestions}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Created:</span>
                            <span className="ml-2">{formatDate(exam.createdAt)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <div className="flex justify-end p-4 pt-0">
                        <Link href={`/exam/${exam.id}`}>
                          <Button>Take Exam</Button>
                        </Link>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <p className="mb-2 text-center text-muted-foreground">No public exams available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

