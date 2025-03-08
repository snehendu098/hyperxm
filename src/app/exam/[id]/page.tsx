"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Eye, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { fetchExam, submitExam } from "@/lib/api"

type ExamQuestion = {
  questionText: string
  options: { id: number; text: string }[]
  points: number
}

type Exam = {
  id: string
  title: string
  description: string
  duration: number
  questions: ExamQuestion[]
}

export default function ExamPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [exam, setExam] = useState<Exam | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadExam = async () => {
      try {
        setIsLoading(true)
        const account = localStorage.getItem("userAccount")

        if (!account) {
          toast({
            title: "Authentication required",
            description: "Please log in to take this exam",
            variant: "destructive",
          })
          router.push("/auth/student")
          return
        }

        const response = await fetchExam(params.id, account)

        if (response.success) {
          setExam(response.data)
          setTimeLeft(response.data.duration * 60) // Convert minutes to seconds
        } else {
          throw new Error(response.message || "Failed to load exam")
        }
      } catch (error) {
        console.error("Error loading exam:", error)
        toast({
          title: "Failed to load exam",
          description: error instanceof Error ? error.message : "Please try again later",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadExam()
  }, [params.id, router, toast])

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          handleSubmitExam()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: Number.parseInt(value),
    })
  }

  const handleNextQuestion = () => {
    if (exam && currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitExam = async () => {
    if (!exam) return

    try {
      setIsSubmitting(true)

      const account = localStorage.getItem("userAccount")
      if (!account) {
        throw new Error("User account not found")
      }

      // Format answers for API
      const formattedAnswers: Record<string, number> = {}

      // In a real implementation, you would map the question IDs from the API
      // For now, we'll use the index as a placeholder
      Object.entries(selectedAnswers).forEach(([index, answer]) => {
        formattedAnswers[`question-${index}`] = answer
      })

      const response = await submitExam(exam.id, account, formattedAnswers)

      if (response.success) {
        toast({
          title: "Exam submitted successfully",
          description: "Your answers have been recorded",
        })

        router.push(`/results/${exam.id}`)
      } else {
        throw new Error(response.message || "Failed to submit exam")
      }
    } catch (error) {
      console.error("Submit exam error:", error)
      toast({
        title: "Failed to submit exam",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="container mx-auto flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Exam Not Found</CardTitle>
            <CardDescription>The exam you're looking for doesn't exist or you don't have access to it.</CardDescription>
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

  const progress = ((currentQuestion + 1) / exam.questions.length) * 100

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/student">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{exam.title}</h1>
            <p className="text-sm text-muted-foreground">Exam ID: {exam.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className={`font-medium ${timeLeft && timeLeft < 300 ? "text-destructive" : ""}`}>
            {timeLeft !== null ? formatTime(timeLeft) : "Time not set"}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2" />
        <div className="mt-2 flex justify-between text-sm text-muted-foreground">
          <span>
            Question {currentQuestion + 1} of {exam.questions.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      <Tabs defaultValue="question">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="question" className="flex-1">
            Question
          </TabsTrigger>
          <TabsTrigger value="instructions" className="flex-1">
            Instructions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="question">
          <Card>
            <CardHeader>
              <CardTitle>{exam.questions[currentQuestion].questionText}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedAnswers[currentQuestion]?.toString()}
                onValueChange={handleAnswerSelect}
                className="space-y-3"
              >
                {exam.questions[currentQuestion].options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center space-x-2 rounded-md border p-3 transition-colors hover:bg-muted"
                  >
                    <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
                    <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                      {option.text}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0 || isSubmitting}
              >
                Previous
              </Button>
              {currentQuestion < exam.questions.length - 1 ? (
                <Button onClick={handleNextQuestion} disabled={isSubmitting}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmitExam} disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Exam"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="instructions">
          <Card>
            <CardHeader>
              <CardTitle>Exam Instructions</CardTitle>
              <CardDescription>Please read carefully before proceeding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  This exam is proctored by AI. Your webcam and microphone will be active during the exam.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p className="text-sm">Do not leave the exam window or open other applications during the exam.</p>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <p className="text-sm">
                  You have {exam.duration} minutes to complete the exam. The timer will continue to run if you close the
                  browser.
                </p>
              </div>
              <Separator />
              <div>
                <h3 className="mb-2 font-medium">Exam Overview</h3>
                <p className="text-sm text-muted-foreground">{exam.description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex flex-wrap gap-2">
        {exam.questions.map((_, i) => (
          <Button
            key={i}
            variant={i === currentQuestion ? "default" : selectedAnswers[i] !== undefined ? "outline" : "ghost"}
            size="sm"
            className="h-8 w-8"
            onClick={() => setCurrentQuestion(i)}
            disabled={isSubmitting}
          >
            {i + 1}
          </Button>
        ))}
      </div>
    </div>
  )
}

