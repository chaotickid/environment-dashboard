"use client"

import { useState } from "react"
import type { Environment } from "@/types/environment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Edit, Database, GitBranch, Settings, User, CheckCircle, ExternalLink } from "lucide-react" // Removed Eye, EyeOff
import { useToast } from "@/hooks/use-toast"

interface EnvironmentDetailsProps {
  environment: Environment
  onBack: () => void
  onEdit: (environment: Environment) => void
}

export function EnvironmentDetails({ environment, onBack, onEdit }: EnvironmentDetailsProps) {
  const { toast } = useToast()
  const [copiedField, setCopiedField] = useState<string>("")

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldName)
      toast({
        title: "Copied to clipboard",
        description: `${fieldName} has been copied to your clipboard.`,
      })
      setTimeout(() => setCopiedField(""), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: Environment["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Maintenance</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(text, fieldName)} className="h-8 w-8 p-0">
      {copiedField === fieldName ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
    </Button>
  )

  // Simplified PasswordField to just display the value and copy button
  const VisiblePasswordField = ({ value, label }: { value: string; label: string }) => (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
      <span className="font-mono text-sm">{value}</span>
      <CopyButton text={value} fieldName={label} />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">{environment.name}</h1>
                  {getStatusBadge(environment.status)}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {new Date(environment.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button onClick={() => onEdit(environment)} className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit Environment</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Environment Login */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Environment Login</span>
              </CardTitle>
              <CardDescription>Authentication credentials for environment access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Login URL</label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <a
                    href={environment.environmentLogin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm truncate flex items-center space-x-1"
                  >
                    <span>{environment.environmentLogin.url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <CopyButton text={environment.environmentLogin.url} fieldName="Environment Login URL" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Login ID</label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="font-mono text-sm">{environment.environmentLogin.id}</span>
                  <CopyButton text={environment.environmentLogin.id} fieldName="Environment Login ID" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Password</label>
                <VisiblePasswordField value={environment.environmentLogin.password} label="Environment Password" />
              </div>
            </CardContent>
          </Card>

          {/* Couchbase Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-orange-600" />
                <span>Couchbase Configuration</span>
              </CardTitle>
              <CardDescription>Database connection and authentication details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Couchbase URL</label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <a
                    href={environment.couchbase.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm truncate flex items-center space-x-1"
                  >
                    <span>{environment.couchbase.url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <CopyButton text={environment.couchbase.url} fieldName="Couchbase URL" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Couchbase ID</label>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span className="font-mono text-sm">{environment.couchbase.id}</span>
                    <CopyButton text={environment.couchbase.id} fieldName="Couchbase ID" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Couchbase Password</label>
                  <VisiblePasswordField value={environment.couchbase.password} label="Couchbase Password" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jenkins Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch className="h-5 w-5 text-purple-600" />
                <span>Jenkins Pipeline</span>
              </CardTitle>
              <CardDescription>CI/CD pipeline configuration and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Pipeline URL</label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <a
                    href={environment.jenkins.pipelineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm truncate flex items-center space-x-1"
                  >
                    <span>{environment.jenkins.pipelineUrl}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <CopyButton text={environment.jenkins.pipelineUrl} fieldName="Jenkins Pipeline URL" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Helm Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-green-600" />
                <span>Helm Configuration</span>
              </CardTitle>
              <CardDescription>Kubernetes deployment configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Helm Chart Path</label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="font-mono text-sm">{environment.helmChartPath}</span>
                  <CopyButton text={environment.helmChartPath} fieldName="Helm Chart Path" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Helm Upgrade Command</label>
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <span className="font-mono text-sm truncate">{environment.helmUpgradeCommand}</span>
                  <CopyButton text={environment.helmUpgradeCommand} fieldName="Helm Upgrade Command" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
