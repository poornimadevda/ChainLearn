"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen } from "lucide-react"
import { StudentCertificateVault } from "./student-certificate-vault"

interface Course {
  id: string
  name: string
  progress: number
  status: "In Progress" | "Completed"
}

interface Certificate {
  id: string
  course: string
  issueDate: string
  hash: string
  verified: boolean
}

export function StudentPortal() {
  const [courses, setCourses] = useState<Course[]>([
    { id: "1", name: "Web Development 101", progress: 85, status: "In Progress" },
    { id: "2", name: "Blockchain Basics", progress: 100, status: "Completed" },
  ])

  const [myCertificates, setMyCertificates] = useState<Certificate[]>([
    {
      id: "cert-001",
      course: "Web Development 101",
      issueDate: "2024-11-15",
      hash: "3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c",
      verified: true,
    },
  ])

  const [verifyCertId, setVerifyCertId] = useState("")
  const [verifyResult, setVerifyResult] = useState<null | boolean>(null)

  const handleVerify = () => {
    if (verifyCertId) {
      setVerifyResult(myCertificates.some((c) => c.id.includes(verifyCertId.slice(0, 7))))
      setTimeout(() => setVerifyResult(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {courses.filter((c) => c.status === "Completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Certificates Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">2</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="certificates">My Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      {course.name}
                    </h3>
                    <span className="text-xs font-medium text-muted-foreground">{course.status}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-accent h-2 rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{course.progress}% Complete</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <StudentCertificateVault />
        </TabsContent>
      </Tabs>
    </div>
  )
}
