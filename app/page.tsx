"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Environment } from "@/types/environment"
import { storageService } from "@/lib/storage"
import { EnvironmentForm } from "@/components/environment-form"
import { EnvironmentDetails } from "@/components/environment-details"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {Plus, Settings, Database, GitBranch, Trash2, Download, Upload, Globe, Sparkles, Timer} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type ViewMode = "dashboard" | "details" | "form"

export default function EnvironmentDashboard() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [currentView, setCurrentView] = useState<ViewMode>("dashboard")
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null)
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const savedEnvironments = storageService.getEnvironments()
    setEnvironments(savedEnvironments)
  }, [])

  const handleViewEnvironment = (environment: Environment) => {
    setSelectedEnvironment(environment)
    setCurrentView("details")
  }

  const handleAddEnvironment = () => {
    setEditingEnvironment(null)
    setCurrentView("form")
  }

  const handleEditEnvironment = (environment: Environment) => {
    setEditingEnvironment(environment)
    setCurrentView("form")
  }

  const handleSaveEnvironment = (environment: Environment) => {
    if (editingEnvironment) {
      storageService.updateEnvironment(environment)
      setEnvironments((prev) => prev.map((env) => (env.id === environment.id ? environment : env)))
      toast({
        title: "✅ Environment updated",
        description: `${environment.name} has been successfully updated.`,
      })
    } else {
      storageService.addEnvironment(environment)
      setEnvironments((prev) => [...prev, environment])
      toast({
        title: "🎉 Environment created",
        description: `${environment.name} has been successfully created.`,
      })
    }
    setCurrentView("dashboard")
    setEditingEnvironment(null)
  }

  const handleDeleteEnvironment = (id: string) => {
    const environment = environments.find((env) => env.id === id)
    if (environment) {
      storageService.deleteEnvironment(id)
      setEnvironments((prev) => prev.filter((env) => env.id !== id))
      toast({
        title: "🗑️ Environment deleted",
        description: `${environment.name} has been successfully deleted.`,
      })
    }
  }

  const handleDownloadData = () => {
    storageService.downloadEnvironments(environments, "environment_dashboard_data.json")
    toast({
      title: "📥 Data Downloaded",
      description: "Your environment data has been downloaded as 'environment_dashboard_data.json'.",
    })
  }

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const uploadedData = await storageService.uploadEnvironments(file)
        setEnvironments(uploadedData)
        toast({
          title: "📤 Data Uploaded",
          description: "Environment data successfully loaded from file.",
        })
      } catch (error: any) {
        toast({
          title: "❌ Upload Failed",
          description: error.message || "Could not upload file. Please check the format.",
          variant: "destructive",
        })
      } finally {
        event.target.value = ""
      }
    }
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedEnvironment(null)
  }

  const handleCancelForm = () => {
    setCurrentView("dashboard")
    setEditingEnvironment(null)
  }

  const getStatusColor = (status: Environment["status"]) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-green-500 to-emerald-500"
      case "inactive":
        return "bg-gradient-to-r from-red-500 to-rose-500"
      case "maintenance":
        return "bg-gradient-to-r from-yellow-500 to-orange-500"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500"
    }
  }

  const getStatusBadge = (status: Environment["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 px-3 py-1 rounded-full">
            🟢 Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600 px-3 py-1 rounded-full">
            🔴 Inactive
          </Badge>
        )
      case "maintenance":
        return (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 px-3 py-1 rounded-full">
            🟡 Maintenance
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="px-3 py-1 rounded-full">
            ❓ Unknown
          </Badge>
        )
    }
  }

  if (currentView === "form") {
    return (
      <EnvironmentForm environment={editingEnvironment} onSave={handleSaveEnvironment} onCancel={handleCancelForm} />
    )
  }

  if (currentView === "details" && selectedEnvironment) {
    return (
      <EnvironmentDetails
        environment={selectedEnvironment}
        onBack={handleBackToDashboard}
        onEdit={handleEditEnvironment}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 via-purple-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-6">
              <div className="p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl shadow-lg">
                <Settings className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Environment Dashboard
                </h1>
                <p className="text-gray-600 mt-2 flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Manage your environments</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm">
                {/*<Badge*/}
                {/*  variant="outline"*/}
                {/*  className="bg-green-50 text-green-700 border-green-200 px-4 py-2 rounded-full font-semibold"*/}
                {/*>*/}
                {/*  {environments.filter((env) => env.status === "active").length} Active*/}
                {/*</Badge>*/}
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 rounded-full font-semibold"
                >
                  {environments.length} Total
                </Badge>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
              <Button
                onClick={handleUploadButtonClick}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold shadow-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </Button>
              <Button
                onClick={handleDownloadData}
                variant="outline"
                className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl font-semibold shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Data
              </Button>
              <Button
                onClick={handleAddEnvironment}
                className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 px-6 py-3 rounded-xl font-semibold shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Environment
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {environments.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl mx-auto w-fit mb-8">
              <Database className="h-20 w-20 text-white mx-auto" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">No environments found</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              Get started by creating your first environment or upload existing data to begin managing your deployments.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleAddEnvironment}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold shadow-lg text-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Environment
              </Button>
              <Button
                onClick={handleUploadButtonClick}
                variant="outline"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 bg-white/80 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold shadow-sm text-lg"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Data
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {environments.map((env) => (
              <Card
                key={env.id}
                className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:bg-white/95 rounded-2xl overflow-hidden transform hover:-translate-y-2"
                onClick={() => handleViewEnvironment(env)}
              >
                <CardHeader className="pb-4 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(env.status)} shadow-lg`} />
                    {getStatusBadge(env.status)}
                  </div>
                  <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors font-bold">
                    {env.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base">
                    Click to view detailed configuration and credentials
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 text-gray-600 bg-orange-50 p-3 rounded-xl">
                      <Database className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Couchbase</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600 bg-purple-50 p-3 rounded-xl">
                      <GitBranch className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Jenkins</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">


                      <div className={"flex-col"}>
                      <span className="text-gray-500 flex items-center space-x-2 mb-2">
                        <Globe className="h-4 w-4"/>
                        <span className={"font-bold"}>Updated At: {new Date(env.updatedAt).toLocaleDateString()}</span>
                      </span>
                        <div className="flex items-center text-gray-500 gap-2">
                          <Timer className="h-4 w-4"/>
                          <h1 className={"font-bold"}>
                            Updated Time: {new Date(env.updatedAt).toLocaleTimeString('en-us', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: true,

                          })}
                          </h1>
                        </div>
                      </div>
                      <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteEnvironment(env.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl p-2"
                      >
                        <Trash2 className="h-4 w-4"/>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
