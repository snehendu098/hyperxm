"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createExam } from "@/lib/api"

// Define types for our form
type Option = {
  id: number
  text: string
}

type Question = {
  questionText: string
  options: Option[]
  correctAnswer: number
  points: number
}

export default function CreateExamPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [examData, setExamData] = useState({
    title: "",
    description: "",
    duration: 60,
    skills: [] as string[],
    expectedPoints: 0,
    isPublic: false,
    questions: [] as Question[],
  })

  // Available skills
  const availableSkills = [
    { id: "blockchain-basics", name: "Blockchain Basics" },
    { id: "cryptography", name: "Cryptography" },
    { id: "smart-contracts", name: "Smart Contracts" },
    { id: "decentralization", name: "Decentralization" },
    { id: "consensus-mechanisms", name: "Consensus Mechanisms" },
  ]

  // Add a new empty question
  const addQuestion = () => {
    setExamData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          options: [
            { id: 1, text: "" },
            { id: 2, text: "" },
            { id: 3, text: "" },
            { id: 4, text: "" },
          ],
          correctAnswer: 1,
          points: 10,
        },
      ],
    }))
  }

  // Remove a question
  const removeQuestion = (index: number) => {
    setExamData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }))
  }

  // Update question text
  const updateQuestionText = (index: number, text: string) => {
    setExamData((prev) => {
      const updatedQuestions = [...prev.questions]
      updatedQuestions[index].questionText = text
      return { ...prev, questions: updatedQuestions }
    })
  }

  // Update option text
  const updateOptionText = (questionIndex: number, optionId: number, text: string) => {
    setExamData((prev) => {
      const updatedQuestions = [...prev.questions]
      const optionIndex = updatedQuestions[questionIndex].options.findIndex((opt) => opt.id === optionId)

      if (optionIndex !== -1) {
        updatedQuestions[questionIndex].options[optionIndex].text = text
      }

      return { ...prev, questions: updatedQuestions }
    })
  }

  // Update correct answer
  const updateCorrectAnswer = (questionIndex: number, answerId: number) => {
    setExamData((prev) => {
      const updatedQuestions = [...prev.questions]
      updatedQuestions[questionIndex].correctAnswer = answerId
      return { ...prev, questions: updatedQuestions }
    })
  }

  // Update question points
  const updateQuestionPoints = (questionIndex: number, points: number) => {
    setExamData((prev) => {
      const updatedQuestions = [...prev.questions]
      updatedQuestions[questionIndex].points = points
      return { ...prev, questions: updatedQuestions }
    })
  }

  // Toggle skill selection
  const toggleSkill = (skillId: string) => {
    setExamData((prev) => {
      if (prev.skills.includes(skillId)) {
        return { ...prev, skills: prev.skills.filter((id) => id !== skillId) }
      } else {
        return { ...prev, skills: [...prev.skills, skillId] }
      }
    })
  }

  // Calculate total points
  const calculateTotalPoints = () => {
    return examData.questions.reduce((sum, q) => sum + q.points, 0)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate form
      if (examData.title.trim() === "") {
        throw new Error("Exam title is required")
      }

      if (examData.questions.length === 0) {
        throw new Error("At least one question is required")
      }

      if (examData.skills.length === 0) {
        throw new Error("At least one skill is required")
      }

      // Validate each question
      for (const [index, question] of examData.questions.entries()) {
        if (question.questionText.trim() === "") {
          throw new Error(`Question ${index + 1} text is required`)
        }

        for (const option of question.options) {
          if (option.text.trim() === "") {
            throw new Error(`All options for question ${index + 1} must be filled`)
          }
        }
      }

      // Get account from localStorage
      const account = localStorage.getItem("userAccount")
      if (!account) {
        throw new Error("User account not found. Please log in again.")
      }

      // Prepare payload
      const payload = {
        ...examData,
        account,
        totalPoints: calculateTotalPoints(),
      }

      // Submit to API
      const response = await createExam(payload)

      if (response.success) {
        toast({
          title: "Exam created successfully",
          description: `Your exam "${examData.title}" has been created.`,
        })

        router.push("/dashboard/teacher")
      } else {
        throw new Error(response.message || "Failed to create exam")
      }
    } catch (error) {
      console.error("Create exam error:", error)
      toast({
        title: "Failed to create exam",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard/teacher">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Exam</h1>
          <p className="text-sm text-muted-foreground">Define exam parameters and questions</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>Basic information about the exam</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Blockchain Technology"
                  value={examData.title}
                  onChange={(e) => setExamData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this exam covers..."
                  value={examData.description}
                  onChange={(e) => setExamData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={5}
                    max={180}
                    value={examData.duration}
                    onChange={(e) =>
                      setExamData((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 60 }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedPoints">Expected Points to Pass</Label>
                  <Input
                    id="expectedPoints"
                    type="number"
                    min={0}
                    value={examData.expectedPoints}
                    onChange={(e) =>
                      setExamData((prev) => ({ ...prev, expectedPoints: Number.parseInt(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Skills Covered</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {availableSkills.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`skill-${skill.id}`}
                        checked={examData.skills.includes(skill.id)}
                        onChange={() => toggleSkill(skill.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`skill-${skill.id}`} className="text-sm">
                        {skill.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={examData.isPublic}
                  onCheckedChange={(checked) => setExamData((prev) => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="public">Make this exam public</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Add questions to your exam</CardDescription>
              </div>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {examData.questions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">No questions added yet</p>
                  <Button type="button" onClick={addQuestion} variant="secondary" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Question
                  </Button>
                </div>
              ) : (
                examData.questions.map((question, qIndex) => (
                  <div key={qIndex} className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-medium">Question {qIndex + 1}</h3>
                      <Button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`q-${qIndex}-text`}>Question Text</Label>
                        <Textarea
                          id={`q-${qIndex}-text`}
                          value={question.questionText}
                          onChange={(e) => updateQuestionText(qIndex, e.target.value)}
                          placeholder="Enter your question here..."
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Options</Label>
                        <div className="space-y-2">
                          {question.options.map((option) => (
                            <div key={option.id} className="flex items-center gap-2">
                              <input
                                type="radio"
                                id={`q-${qIndex}-opt-${option.id}`}
                                name={`q-${qIndex}-correct`}
                                checked={question.correctAnswer === option.id}
                                onChange={() => updateCorrectAnswer(qIndex, option.id)}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                              />
                              <Input
                                value={option.text}
                                onChange={(e) => updateOptionText(qIndex, option.id, e.target.value)}
                                placeholder={`Option ${option.id}`}
                                required
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Select the radio button for the correct answer</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`q-${qIndex}-points`}>Points</Label>
                        <Input
                          id={`q-${qIndex}-points`}
                          type="number"
                          min={1}
                          value={question.points}
                          onChange={(e) => updateQuestionPoints(qIndex, Number.parseInt(e.target.value) || 10)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div>
                <p className="text-sm font-medium">Total Questions: {examData.questions.length}</p>
                <p className="text-sm text-muted-foreground">Total Points: {calculateTotalPoints()}</p>
              </div>
              <div className="flex gap-2">
                <Link href="/dashboard/teacher">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading || examData.questions.length === 0}>
                  {isLoading ? "Creating..." : "Create Exam"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}

