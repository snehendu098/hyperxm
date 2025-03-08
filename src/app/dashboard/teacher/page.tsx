"use client"

import Link from "next/link"
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, PlusCircle, Settings, User, Users } from "lucide-react"

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

export default function TeacherDashboard() {
  const activeExams = [
    {
      id: "1",
      title: "Introduction to Blockchain",
      date: "2025-03-15T10:00:00",
      registeredStudents: 45,
      status: "Registration Open",
    },
    {
      id: "2",
      title: "Smart Contract Development",
      date: "2025-03-20T14:00:00",
      registeredStudents: 32,
      status: "Registration Open",
    },
  ]

  const completedExams = [
    {
      id: "3",
      title: "Blockchain Basics",
      date: "2025-02-10T10:00:00",
      participants: 50,
      averageScore: 85,
    },
    {
      id: "4",
      title: "Cryptography Fundamentals",
      date: "2025-02-15T14:00:00",
      participants: 48,
      averageScore: 78,
    },
  ]

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
                  <Link href="/dashboard/teacher">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/teacher/exams">
                    <BookOpen className="h-4 w-4" />
                    <span>Exams</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/teacher/students">
                    <Users className="h-4 w-4" />
                    <span>Students</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/teacher/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <Link href="/">
              <Button variant="outline" className="w-full justify-start">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </Link>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px]">
            <SidebarTrigger />
            <div className="w-full flex-1">
              <h1 className="text-xl font-semibold">Teacher Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                Prof. Smith
              </Button>
            </div>
          </header>
          <main className="flex-1 space-y-4 p-4 md:p-8">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
              <Link href="/dashboard/teacher/exams/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Exam
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-xs text-muted-foreground">2 active, 2 completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">77</div>
                  <p className="text-xs text-muted-foreground">Across all active exams</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">81.5%</div>
                  <Progress value={81.5} className="mt-2" />
                </CardContent>
              </Card>
            </div>
            <Tabs defaultValue="active">
              <div className="flex items-center justify-between">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active Exams</TabsTrigger>
                  <TabsTrigger value="completed">Completed Exams</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="active" className="space-y-4">
                {activeExams.map((exam) => (
                  <Card key={exam.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{exam.title}</CardTitle>
                      <CardDescription>Scheduled for {new Date(exam.date).toLocaleString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="font-medium">Status:</span>
                          <span className="ml-2">{exam.status}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Registered Students:</span>
                          <span className="ml-2">{exam.registeredStudents}</span>
                        </div>
                      </div>
                    </CardContent>
                    <div className="flex justify-end gap-2 p-4 pt-0">
                      <Link href={`/dashboard/teacher/exams/${exam.id}/edit`}>
                        <Button variant="outline">Edit Exam</Button>
                      </Link>
                      <Link href={`/dashboard/teacher/exams/${exam.id}`}>
                        <Button>Manage Exam</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="completed" className="space-y-4">
                {completedExams.map((exam) => (
                  <Card key={exam.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{exam.title}</CardTitle>
                      <CardDescription>Completed on {new Date(exam.date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="font-medium">Participants:</span>
                          <span className="ml-2">{exam.participants}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">Average Score:</span>
                          <span className="ml-2">{exam.averageScore}%</span>
                        </div>
                      </div>
                    </CardContent>
                    <div className="flex justify-end p-4 pt-0">
                      <Link href={`/dashboard/teacher/exams/${exam.id}/results`}>
                        <Button>View Results</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

