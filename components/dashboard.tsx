"use client"
import { Button } from "@/components/ui/button"
import { AdminPanel } from "./admin-panel"
import { TeacherPanel } from "./teacher-panel"
import { StudentPortal } from "./student-portal"
import { LogOut, Settings } from "lucide-react"

interface DashboardProps {
  userRole: "admin" | "teacher" | "student"
  onLogout: () => void
}

export function Dashboard({ userRole, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">ChainLearn</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground capitalize">{userRole} Portal</span>
            <Button variant="ghost" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {userRole === "admin" && <AdminPanel />}
        {userRole === "teacher" && <TeacherPanel />}
        {userRole === "student" && <StudentPortal />}
      </main>
    </div>
  )
}
