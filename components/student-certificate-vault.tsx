"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Award, Download, Share2, Eye, QrCode, Copy, CheckCircle2 } from "lucide-react"
import { CertificateTemplate } from "./certificate-template"

interface StudentCertificate {
  id: string
  course: string
  grade: string
  issueDate: string
  certificateId: string
  blockchainHash: string
  verified: boolean
}

export function StudentCertificateVault() {
  const [myCertificates, setMyCertificates] = useState<StudentCertificate[]>([
    {
      id: "cert-001",
      course: "Web Development 101",
      grade: "A",
      issueDate: "2024-11-22",
      certificateId: "CERT-2024-001-WEB101",
      blockchainHash: "3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f",
      verified: true,
    },
    {
      id: "cert-002",
      course: "Blockchain Basics",
      grade: "A+",
      issueDate: "2024-10-15",
      certificateId: "CERT-2024-002-BC101",
      blockchainHash: "1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d",
      verified: true,
    },
  ])

  const [selectedCert, setSelectedCert] = useState<StudentCertificate | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [shareLink, setShareLink] = useState("")

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const generateShareLink = (cert: StudentCertificate) => {
    const link = `${window.location.origin}/verify?cert=${cert.certificateId}`
    setShareLink(link)
  }

  const stats = {
    total: myCertificates.length,
    verified: myCertificates.filter((c) => c.verified).length,
    pending: myCertificates.filter((c) => !c.verified).length,
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Blockchain Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Certificate List */}
      <Card>
        <CardHeader>
          <CardTitle>My Certificates</CardTitle>
          <CardDescription>Your academic credentials verified on blockchain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {myCertificates.length > 0 ? (
            myCertificates.map((cert) => (
              <div key={cert.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-accent" />
                      <h3 className="font-medium text-foreground">{cert.course}</h3>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-100">
                        {cert.grade}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Issued: {cert.issueDate}</p>
                    <p className="text-xs font-mono text-muted-foreground mt-1">ID: {cert.certificateId}</p>
                  </div>
                  {cert.verified && (
                    <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
                      <CheckCircle2 className="w-5 h-5" />
                      Verified
                    </div>
                  )}
                </div>

                {/* Blockchain Hash */}
                <div className="p-3 bg-muted/50 rounded flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Blockchain Hash</p>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      {cert.blockchainHash.substring(0, 40)}...
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(cert.blockchainHash, cert.id)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCert(cert)
                      setShowPreview(true)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => generateShareLink(cert)}>
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline">
                    <QrCode className="w-4 h-4 mr-1" />
                    QR Code
                  </Button>
                </div>

                {shareLink && (
                  <div className="p-3 bg-accent/10 rounded border border-accent/20">
                    <p className="text-xs text-muted-foreground mb-2">Share Link:</p>
                    <div className="flex gap-2">
                      <Input value={shareLink} readOnly size="sm" className="text-xs" />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(shareLink)
                          setShareLink("")
                        }}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No certificates yet. Complete courses to earn certificates!</p>
            </div>
          )}
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
                studentName="Alice Johnson"
                courseName={selectedCert.course}
                issueDate={selectedCert.issueDate}
                certificateId={selectedCert.certificateId}
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
