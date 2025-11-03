"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle2, Award, Download } from "lucide-react"
import { CertificateTemplate } from "./certificate-template"

interface CertificateRecord {
  id: string
  studentName: string
  studentEmail: string
  courseName: string
  grade: string
  score: number
  issueDate: string | null
  certificateId: string | null
  blockchainHash: string | null
  status: "pending" | "issued" | "verified"
}

export function CertificateIssuance() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([
    {
      id: "1",
      studentName: "Bob Smith",
      studentEmail: "bob@student.com",
      courseName: "Web Development 101",
      grade: "A",
      score: 95,
      issueDate: "2024-11-22",
      certificateId: "CERT-2024-001-WEB101",
      blockchainHash: "3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2",
      status: "verified",
    },
    {
      id: "2",
      studentName: "Carol Davis",
      studentEmail: "carol@student.com",
      courseName: "Web Development 101",
      grade: "B",
      score: 87,
      issueDate: "2024-11-22",
      certificateId: "CERT-2024-002-WEB101",
      blockchainHash: "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p",
      status: "issued",
    },
    {
      id: "3",
      studentName: "Alice Johnson",
      studentEmail: "alice@student.com",
      courseName: "Web Development 101",
      grade: "A",
      score: 92,
      issueDate: null,
      certificateId: null,
      blockchainHash: null,
      status: "pending",
    },
  ])

  const [selectedCert, setSelectedCert] = useState<CertificateRecord | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const issueCertificate = (id: string) => {
    const now = new Date()
    const issueDate = now.toISOString().split("T")[0]
    const certId = `CERT-${now.getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}-WEB101`

    setCertificates(
      certificates.map((cert) =>
        cert.id === id
          ? {
              ...cert,
              issueDate,
              certificateId: certId,
              status: "issued",
            }
          : cert,
      ),
    )
  }

  const verifyOnBlockchain = (id: string) => {
    const blockchainHash = `${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
    setCertificates(
      certificates.map((cert) =>
        cert.id === id
          ? {
              ...cert,
              blockchainHash,
              status: "verified",
            }
          : cert,
      ),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-100"
      case "issued":
        return "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-100"
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-100"
      default:
        return ""
    }
  }

  const pendingCount = certificates.filter((c) => c.status === "pending").length
  const issuedCount = certificates.filter((c) => c.status === "issued").length
  const verifiedCount = certificates.filter((c) => c.status === "verified").length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{certificates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{issuedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{verifiedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate List */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Management</CardTitle>
          <CardDescription>Manage and issue blockchain-verified certificates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {certificates.map((cert) => (
            <div key={cert.id} className="p-4 border border-border rounded-lg space-y-3 hover:bg-muted/30 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-accent" />
                    <h3 className="font-medium text-foreground">{cert.studentName}</h3>
                    <Badge className={getStatusColor(cert.status)}>{cert.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{cert.courseName}</p>
                  <p className="text-xs text-muted-foreground">Email: {cert.studentEmail}</p>
                  <p className="text-xs text-muted-foreground">
                    Grade: {cert.grade} ({cert.score}%)
                  </p>
                  {cert.certificateId && (
                    <p className="text-xs font-mono text-muted-foreground mt-1">ID: {cert.certificateId}</p>
                  )}
                  {cert.blockchainHash && (
                    <p className="text-xs font-mono text-muted-foreground break-all">Hash: {cert.blockchainHash}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {cert.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => issueCertificate(cert.id)}
                      className="bg-accent hover:bg-accent/90"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Issue
                    </Button>
                  )}
                  {cert.status === "issued" && (
                    <Button
                      size="sm"
                      onClick={() => verifyOnBlockchain(cert.id)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Verify
                    </Button>
                  )}
                  {cert.certificateId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCert(cert)
                        setShowPreview(true)
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Certificate Preview Modal */}
      {showPreview && selectedCert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Certificate Preview</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CertificateTemplate
                studentName={selectedCert.studentName}
                courseName={selectedCert.courseName}
                issueDate={selectedCert.issueDate || new Date().toISOString().split("T")[0]}
                certificateId={selectedCert.certificateId || "CERT-PREVIEW"}
                instructorName="Dr. Sarah Smith"
                grade={selectedCert.grade}
                blockchainHash={selectedCert.blockchainHash}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
