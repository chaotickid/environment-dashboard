"use client"

import { useState } from "react"
import type { Environment } from "@/types/environment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Copy,
  Edit,
  Database,
  GitBranch,
  Settings,
  User,
  CheckCircle,
  ExternalLink,
  Globe,
  Shield,
  Terminal,
} from "lucide-react"
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
        title: "✅ Copied to clipboard",
        description: `${fieldName} has been copied to your clipboard.`,
      })
      setTimeout(() => setCopiedField(""), 2000)
    } catch (err) {
      toast({
        title: "❌ Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: Environment["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 px-4 py-1 rounded-full">
            🟢 Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 px-4 py-1 rounded-full">
            🔴 Inactive
          </Badge>
        )
      case "maintenance":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 px-4 py-1 rounded-full">
            🟡 Maintenance
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="px-4 py-1 rounded-full">
            ❓ Unknown
          </Badge>
        )
    }
  }

  const CopyButton = ({ text, fieldName }: { text: string; fieldName: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, fieldName)}
      className="h-9 w-9 p-0 hover:bg-blue-100 rounded-xl transition-all"
    >
      {copiedField === fieldName ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4 text-gray-500" />
      )}
    </Button>
  )

  const VisiblePasswordField = ({ value, label }: { value: string; label: string }) => (
    <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 p-4 rounded-xl shadow-sm">
      <div className="flex items-center space-x-3">
        <Shield className="h-4 w-4 text-gray-500" />
        <span className="font-mono text-sm text-gray-800 select-all">{value}</span>
      </div>
      <CopyButton text={value} fieldName={label} />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-8">
            <div className="flex items-center space-x-6">
              <Button variant="ghost" onClick={onBack} className="p-3 hover:bg-blue-100 rounded-xl transition-all">
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </Button>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      {environment.name}
                    </h1>
                    {getStatusBadge(environment.status)}
                  </div>
                  <p className="text-sm text-gray-600 flex items-center space-x-2">
                    <span>Last updated: {new Date(environment.updatedAt).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            </div>
            <Button
              onClick={() => onEdit(environment)}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-xl shadow-lg"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Environment</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8">
          {/* Environment Logins */}
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <User className="h-6 w-6" />
                <span>Environment Logins</span>
              </CardTitle>
              <CardDescription className="text-green-100">
                Authentication credentials for environment access
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              {environment.environmentLogin.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No login details available for this environment.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {environment.environmentLogin.map((login, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-100 p-6 rounded-2xl shadow-sm"
                    >
                      <h4 className="font-bold text-lg text-gray-800 mb-4 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{login.label || `Login ${index + 1}`}</span>
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center space-x-2">
                            <Globe className="h-4 w-4" />
                            <span>Login URL</span>
                          </label>
                          <div className="flex items-center justify-between bg-white border-2 border-green-200 p-4 rounded-xl shadow-sm">
                            <a
                              href={login.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-sm truncate flex items-center space-x-2 font-medium"
                            >
                              <span>{login.url}</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            <CopyButton text={login.url} fieldName={`${login.label} Login URL`} />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>Login ID</span>
                          </label>
                          <div className="flex items-center justify-between bg-white border-2 border-green-200 p-4 rounded-xl shadow-sm">
                            <span className="font-mono text-sm text-gray-800 select-all">{login.id}</span>
                            <CopyButton text={login.id} fieldName={`${login.label} Login ID`} />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center space-x-2">
                            <Shield className="h-4 w-4" />
                            <span>Password</span>
                          </label>
                          <VisiblePasswordField value={login.password} label={`${login.label} Password`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Couchbase Details */}
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <Database className="h-6 w-6" />
                <span>Couchbase Configuration</span>
              </CardTitle>
              <CardDescription className="text-orange-100">
                Database connection and authentication details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center space-x-2">
                  <Database className="h-4 w-4" />
                  <span>Couchbase URL</span>
                </label>
                <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 p-4 rounded-xl shadow-sm">
                  <a
                    href={environment.couchbase.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm truncate flex items-center space-x-2 font-medium"
                  >
                    <span>{environment.couchbase.url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <CopyButton text={environment.couchbase.url} fieldName="Couchbase URL" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Couchbase ID</span>
                  </label>
                  <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 p-4 rounded-xl shadow-sm">
                    <span className="font-mono text-sm text-gray-800 select-all">{environment.couchbase.id}</span>
                    <CopyButton text={environment.couchbase.id} fieldName="Couchbase ID" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Couchbase Password</span>
                  </label>
                  <VisiblePasswordField value={environment.couchbase.password} label="Couchbase Password" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jenkins Pipeline */}
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <GitBranch className="h-6 w-6" />
                <span>Jenkins Pipeline</span>
              </CardTitle>
              <CardDescription className="text-purple-100">CI/CD pipeline configuration and access</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center space-x-2">
                  <GitBranch className="h-4 w-4" />
                  <span>Pipeline URL</span>
                </label>
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 p-4 rounded-xl shadow-sm">
                  <a
                    href={environment.jenkins.pipelineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm truncate flex items-center space-x-2 font-medium"
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
          <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <Settings className="h-6 w-6" />
                <span>Helm Configuration</span>
              </CardTitle>
              <CardDescription className="text-teal-100">Kubernetes deployment configuration</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Helm Chart Path</span>
                </label>
                <div className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 p-4 rounded-xl shadow-sm">
                  <span className="font-mono text-sm text-gray-800 select-all">{environment.helmChartPath}</span>
                  <CopyButton text={environment.helmChartPath} fieldName="Helm Chart Path" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-3 block flex items-center space-x-2">
                  <Terminal className="h-4 w-4" />
                  <span>Helm Upgrade Command</span>
                </label>
                <div className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 p-4 rounded-xl shadow-sm">
                  <span className="font-mono text-sm text-gray-800 truncate select-all">
                    {environment.helmUpgradeCommand}
                  </span>
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
