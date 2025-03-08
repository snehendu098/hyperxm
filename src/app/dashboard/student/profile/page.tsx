"use client"

import Link from "next/link"
import { Award, BookOpen, Download, GraduationCap, LayoutDashboard, LogOut, Settings, Trophy, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function StudentProfile() {
  // Mock profile data
  const profile = {
    name: "John Doe",
    university: "Blockchain University",
    studentId: "BU12345",
    joinedDate: "January 2025",
    totalExams: 7,
    completedExams: 5,
    totalXP: 270,
    skills: [
      { name: "Blockchain Fundamentals", level: 3, xp: 120, progress: 80 },
      { name: "Cryptography", level: 2, xp: 90, progress: 60 },
      { name: "Smart Contracts", level: 1, xp: 60, progress: 40 },
    ],
    achievements: [
      { name: "First Exam Completed", date: "Feb 10, 2025", icon: BookOpen },
      { name: "Perfect Score", date: "Feb 15, 2025", icon: Award },
      { name: "Blockchain Expert", date: "Mar 1, 2025", icon: Trophy },
    ],
    credentials: [
      { name: "Blockchain Basics", issuer: "Blockchain University", date: "Feb 10, 2025", score: 85 },
      { name: "Cryptography Fundamentals", issuer: "Crypto Academy", date: "Feb 15, 2025", score: 92 },
    ],
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
                <SidebarMenuButton asChild>
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
                <SidebarMenuButton asChild isActive>
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
              <h1 className="text-xl font-semibold">Student Profile</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">
                <User className="mr-2 h-4 w-4" />
                {profile.name}
              </Button>
            </div>
          </header>
          <main className="flex-1 space-y-4 p-4 md:p-8">
            <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <h2 className="text-xl font-bold">{profile.name}</h2>
                  <p className="text-sm text-muted-foreground">{profile.university}</p>
                  <p className="text-xs text-muted-foreground">Student ID: {profile.studentId}</p>
                  <p className="text-xs text-muted-foreground">Joined: {profile.joinedDate}</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export Profile
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Your exam statistics and skill progress</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                      <BookOpen className="mb-1 h-5 w-5 text-muted-foreground" />
                      <span className="text-xl font-bold">{profile.totalExams}</span>
                      <span className="text-xs text-muted-foreground">Total Exams</span>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                      <GraduationCap className="mb-1 h-5 w-5 text-muted-foreground" />
                      <span className="text-xl font-bold">{profile.completedExams}</span>
                      <span className="text-xs text-muted-foreground">Completed</span>
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                      <Trophy className="mb-1 h-5 w-5 text-muted-foreground" />
                      <span className="text-xl font-bold">{profile.totalXP}</span>
                      <span className="text-xs text-muted-foreground">Total XP</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium">Skills</h3>
                    {profile.skills.map((skill, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{skill.name}</span>
                          <span className="text-sm font-medium">
                            Level {skill.level} • {skill.xp} XP
                          </span>
                        </div>
                        <Progress value={skill.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="credentials">
              <TabsList className="mb-4">
                <TabsTrigger value="credentials">On-Chain Credentials</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="nft">NFT Resume</TabsTrigger>
              </TabsList>
              <TabsContent value="credentials" className="space-y-4">
                {profile.credentials.map((credential, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle>{credential.name}</CardTitle>
                      <CardDescription>
                        Issued by {credential.issuer} on {credential.date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">Score: {credential.score}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Blockchain Verified</span>
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Download Certificate
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="achievements" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {profile.achievements.map((achievement, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2 text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <achievement.icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-base">{achievement.name}</CardTitle>
                        <CardDescription>Earned on {achievement.date}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="nft" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>NFT Resume</CardTitle>
                    <CardDescription>Your on-chain verifiable resume</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="relative h-64 w-64 rounded-lg border bg-muted p-4">
                      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-6 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Award className="h-8 w-8" />
                        </div>
                        <h3 className="mb-1 text-lg font-bold">{profile.name}</h3>
                        <p className="mb-4 text-sm text-muted-foreground">{profile.university}</p>
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{profile.totalXP} XP</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                      Your NFT resume is a verifiable on-chain credential that showcases your academic achievements.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button>
                      <Award className="mr-2 h-4 w-4" />
                      Mint NFT Resume
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

