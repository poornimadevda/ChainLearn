"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Send, Trash2, Edit2 } from "lucide-react"

interface StudentGrade {
  id: string
  name: string
  email: string
  submissionDate: string
  grade: string | null
  score: number | null
  feedback: string
  certificateIssued: boolean
}

export function GradeManagement() {
  const [students, setStudents] = useState<StudentGrade[]>([
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@student.com",
      submissionDate: "2024-11-20",
      grade: null,
      score: null,
      feedback: "",
      certificateIssued: false,
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@student.com",
      submissionDate: "2024-11-19",
      grade: "A",
      score: 95,
      feedback: "Excellent work! Great understanding of the concepts.",
      certificateIssued: true,
    },
    {
      id: "3",
      name: "Carol Davis",
      email: "carol@student.com",
      submissionDate: "2024-11-18",
      grade: "B",
      score: 87,
      feedback: "Good work. Please review section 3 for more clarity.",
      certificateIssued: true,
    },
  ])

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [grade, setGrade] = useState("")
  const [score, setScore] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const submitGrade = () => {
    if (selectedStudent && grade && score) {
      setStudents(
        students.map((s) =>
          s.id === selectedStudent
            ? { ...s, grade, score: Number.parseInt(score), feedback, certificateIssued: false }
            : s,
        ),
      )
      resetForm()
    }
  }

  const resetForm = () => {
    setGrade("")
    setScore("")
    setFeedback("")
    setSelectedStudent(null)
    setIsEditing(false)
  }

  const deleteGrade = (id: string) => {
    setStudents(students.map((s) => (s.id === id ? { ...s, grade: null, score: null, feedback: "" } : s)))
  }

  const editGrade = (student: StudentGrade) => {
    setSelectedStudent(student.id)
    setGrade(student.grade || "")
    setScore(student.score?.toString() || "")
    setFeedback(student.feedback)
    setIsEditing(true)
  }

  const gradeStats = {
    total: students.length,
    graded: students.filter((s) => s.grade).length,
    pending: students.filter((s) => !s.grade).length,
    average:
      students.filter((s) => s.score).reduce((sum, s) => sum + (s.score || 0), 0) /
      Math.max(students.filter((s) => s.score).length, 1),
  }

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-100"
    if (["A", "A+"].includes(grade)) return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-100"
    if (["B", "B+"].includes(grade)) return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-100"
    if (["C", "C+"].includes(grade)) return "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-100"
    return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-100"
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{gradeStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Graded</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{gradeStats.graded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{gradeStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Class Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{gradeStats.average.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submit">Submit/Edit Grades</TabsTrigger>
          <TabsTrigger value="review">Review & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-4">
          {/* Grade Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? "Edit Student Grade" : "Submit New Grade"}</CardTitle>
              <CardDescription>Enter grades and feedback for students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Student</label>
                  <select
                    value={selectedStudent || ""}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
                    disabled={isEditing}
                  >
                    <option value="">Select Student</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.grade ? `(${s.grade})` : "(No grade)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Grade</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mt-1"
                    >
                      <option value="">Select Grade</option>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="C+">C+</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Score (%)</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Feedback</label>
                  <textarea
                    placeholder="Provide constructive feedback for the student..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground mt-1 min-h-20 resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={submitGrade} className="flex-1 bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4 mr-2" />
                    {isEditing ? "Update Grade" : "Submit Grade"}
                  </Button>
                  {isEditing && (
                    <Button onClick={resetForm} variant="outline" className="flex-1 bg-transparent">
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Grades List */}
          <Card>
            <CardHeader>
              <CardTitle>Student Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      {student.feedback && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Feedback: {student.feedback.substring(0, 50)}...
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {student.grade ? (
                        <Badge className={getGradeColor(student.grade)}>
                          {student.grade} ({student.score}%)
                        </Badge>
                      ) : (
                        <Badge className={getGradeColor(null)}>Pending</Badge>
                      )}
                      <div className="flex gap-2">
                        {student.grade && (
                          <Button variant="ghost" size="icon" onClick={() => editGrade(student)} title="Edit grade">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {student.grade && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => deleteGrade(student.id)}
                            title="Delete grade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Summary</CardTitle>
              <CardDescription>Overview of all submitted grades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students
                  .filter((s) => s.grade)
                  .map((student) => (
                    <div key={student.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">{student.name}</h3>
                        <Badge className={getGradeColor(student.grade)}>
                          {student.grade} ({student.score}%)
                        </Badge>
                      </div>
                      {student.feedback && <p className="text-sm text-muted-foreground">{student.feedback}</p>}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full bg-transparent">
                Export as CSV
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Export as PDF Report
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                Send to LMS
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
