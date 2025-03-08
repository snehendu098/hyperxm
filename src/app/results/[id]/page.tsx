"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Award, Check, Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { getExamResults } from "@/lib/api"

type QuestionResult = {
  question: string
  options: { id: number; text: string }[]
  correct: boolean
  option: number
  actualOption: number
}

type ExamResult = {
  qna: QuestionResult[]
  points: number
  xp: number
  avgPoints: number
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [results, setResults] = useState<ExamResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [examTitle, setExamTitle] = useState("Exam Results")

  useEffect(() => {
    const loadResults = async () => {
      try {
        setIsLoading(true)
        const account = localStorage.getItem("userAccount")

        if (!account) {
          toast({
            title: "Authentication required",
            description: "Please log in to view results",
            variant: "destructive",
          })
          router.push("/auth/student")
          return
        }

        const response = await getExamResults(params.id, account)

        if (response.success) {
          setResults(response.data)
          // If we have exam title in the response, set it
          if (response.data.title) {
            setExamTitle(response.data.title)
          }
        } else {
          throw new Error(response.message || "Failed to load results")
        }
      } catch (error) {
        console.error("Error loading results:", error)
        toast({
          title: "Failed to load results",
          description: error instanceof Error ? error.message : "Please try again later",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadResults()
  }, [params.id, router, toast])

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Results Not Found</CardTitle>
            <CardDescription>
              The exam results you're looking for don't exist or you don't have access to them.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard/student" className="w-full">
              <Button className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Calculate score percentage
  const totalQuestions = results.qna.length
  const correctAnswers = results.qna.filter((q) => q.correct).length
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100)

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/student">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Exam Results</h1>
          <p className="text-sm text-muted-foreground">{examTitle}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Overall Score</CardTitle>
            <CardDescription>Your performance on this exam</CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center justify-center">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-muted-foreground/20"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    strokeWidth="10"
                  />
                  <circle
                    className="stroke-primary"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    strokeWidth="10"
                    strokeDasharray={`${scorePercentage * 2.83} ${(100 - scorePercentage) * 2.83}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold">{scorePercentage}%</span>
                  <span className="text-xs text-muted-foreground">
                    {correctAnswers} / {totalQuestions} correct
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Certificate
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Skill XP Earned</CardTitle>
            <CardDescription>XP added to your on-chain profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total XP Earned</span>
                <span className="text-sm font-medium">{results.xp} XP</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Points Earned</span>
                <span className="text-sm font-medium">{results.points} points</span>
              </div>
              <Progress value={(results.points / results.avgPoints) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Points</span>
                <span className="text-sm font-medium">{results.avgPoints} points</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-muted-foreground/50" style={{ width: "100%" }}></div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">
              <Award className="mr-2 h-4 w-4" />
              Mint NFT Resume
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Detailed breakdown of your answers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <Check className="h-4 w-4" />
                </div>
                <span>Correct</span>
              </div>
              <span className="font-medium">{correctAnswers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                  <X className="h-4 w-4" />
                </div>
                <span>Incorrect</span>
              </div>
              <span className="font-medium">{totalQuestions - correctAnswers}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                  <Award className="h-4 w-4" />
                </div>
                <span>Total XP</span>
              </div>
              <span className="font-medium">{results.xp} XP</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="mb-4 mt-8 text-xl font-bold">Question Breakdown</h2>
      <div className="space-y-4">
        {results.qna.map((question, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{question.question}</CardTitle>
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    question.correct
                      ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {question.correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2 text-sm">
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Your Answer:</span>
                  <p className={`mt-1 ${!question.correct ? "text-red-500 dark:text-red-400" : ""}`}>
                    {question.options.find((opt) => opt.id === question.option)?.text || "No answer selected"}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Correct Answer:</span>
                  <p className="mt-1 text-green-600 dark:text-green-400">
                    {question.options.find((opt) => opt.id === question.actualOption)?.text || "Unknown"}
                  </p>
                </div>
                <Separator />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <Link href="/dashboard/student">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Button>
          <Award className="mr-2 h-4 w-4" />
          Mint NFT Resume
        </Button>
      </div>
    </div>
  )
}

