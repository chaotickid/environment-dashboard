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
import { Plus, Settings, Database, GitBranch, Trash2, Download, Upload } from "lucide-react"
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
        title: "Environment updated",
        description: `${environment.name} has been successfully updated.`,
      })
    } else {
      storageService.addEnvironment(environment)
      setEnvironments((prev) => [...prev, environment])
      toast({
        title: "Environment created",
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
        title: "Environment deleted",
        description: `${environment.name} has been successfully deleted.`,
      })
    }
  }

  const handleDownloadData = () => {
    storageService.downloadEnvironments(environments, "environment_dashboard_data.json")
    toast({
      title: "Data Downloaded",
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
          title: "Data Uploaded",
          description: "Environment data successfully loaded from file.",
        })
      } catch (error: any) {
        toast({
          title: "Upload Failed",
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
        return "bg-green-500"
      case "inactive":
        return "bg-red-500"
      case "maintenance":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Environment Dashboard
                </h1>
                <p className="text-gray-600 mt-1">Manage your environments</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {environments.filter((env) => env.status === "active").length} Active
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {environments.length} Total
                </Badge>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
              <Button
                onClick={handleUploadButtonClick}
                variant="outline"
                className="border-gray-400 text-gray-700 hover:bg-gray-100 bg-transparent"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </Button>
              <Button
                onClick={handleDownloadData}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Data
              </Button>
              <Button
                onClick={handleAddEnvironment}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
          <div className="text-center py-12">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No environments found</h3>
            <p className="text-gray-600 mb-6">
              Get started by creating your first environment or upload existing data.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleAddEnvironment}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Environment
              </Button>
              <Button
                onClick={handleUploadButtonClick}
                variant="outline"
                className="border-gray-400 text-gray-700 hover:bg-gray-100 bg-transparent"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {environments.map((env) => (
              <Card
                key={env.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                onClick={() => handleViewEnvironment(env)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(env.status)} shadow-lg`} />
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{env.name}</CardTitle>
                    </div>
                    {getStatusBadge(env.status)}
                  </div>
                  <CardDescription className="text-gray-600">Click to view detailed configuration</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Database className="h-4 w-4" />
                      <span>Couchbase</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <GitBranch className="h-4 w-4" />
                      <span>Jenkins</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className={"flex-col"}>
                      <div className="text-xs text-gray-500 font-bold mb-2">
                        Updated Date {new Date(env.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 font-bold">
                        Updated Time {new Date(env.updatedAt).toLocaleTimeString('en-us', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true,
                      })}
                      </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEnvironment(env.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
