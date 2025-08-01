"use client"

import type React from "react"

import { useState } from "react"
import type { Environment } from "@/types/environment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Save, X, PlusCircle, MinusCircle, User, Database, GitBranch, Settings, Globe } from "lucide-react"

interface EnvironmentFormProps {
  environment?: Environment
  onSave: (environment: Environment) => void
  onCancel: () => void
}

export function EnvironmentForm({ environment, onSave, onCancel }: EnvironmentFormProps) {
  const [formData, setFormData] = useState<Environment>(() => {
    // Create a safe default environment structure
    const defaultEnvironment: Environment = {
      id: crypto.randomUUID(),
      name: "",
      status: "active",
      environmentLogin: [{ label: "", url: "", id: "", password: "" }], // Always start with one login
      couchbase: {
        url: "",
        id: "sysadmin",
        password: "Crd!@Mav123",
      },
      jenkins: {
        pipelineUrl: "",
      },
      helmChartPath: "",
      helmUpgradeCommand: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // If no environment is provided, return the default
    if (!environment) {
      return defaultEnvironment
    }

    // If environment is provided, safely merge it with defaults
    const safeEnvironment: Environment = {
      ...defaultEnvironment,
      ...environment,
      // Ensure these nested objects exist
      couchbase: {
        ...defaultEnvironment.couchbase,
        ...(environment.couchbase || {}),
      },
      jenkins: {
        ...defaultEnvironment.jenkins,
        ...(environment.jenkins || {}),
      },
    }

    // Handle environmentLogin safely - this is the critical part
    let safeLogins: Array<{ label: string; url: string; id: string; password: string }> = []

    if (environment.environmentLogin) {
      if (Array.isArray(environment.environmentLogin)) {
        // It's already an array, use it
        safeLogins = environment.environmentLogin.map((login) => ({
          label: login.label || "",
          url: login.url || "",
          id: login.id || "",
          password: login.password || "",
        }))
      } else if (typeof environment.environmentLogin === "object" && environment.environmentLogin !== null) {
        // It's a single object (old schema), convert to array
        const singleLogin = environment.environmentLogin as any
        safeLogins = [
          {
            label: singleLogin.label || "",
            url: singleLogin.url || "",
            id: singleLogin.id || "",
            password: singleLogin.password || "",
          },
        ]
      }
    }

    // If we still don't have any logins, add a default one
    if (safeLogins.length === 0) {
      safeLogins = [{ label: "", url: "", id: "", password: "" }]
    }

    return {
      ...safeEnvironment,
      environmentLogin: safeLogins,
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedEnvironment = {
      ...formData,
      updatedAt: new Date().toISOString(),
    }
    onSave(updatedEnvironment)
  }

  const updateField = (path: string, value: string) => {
    setFormData((prev) => {
      const keys = path.split(".")
      const updated = { ...prev }

      // Handle the special case of environmentLogin array updates
      if (keys[0] === "environmentLogin" && keys.length === 3) {
        const index = Number.parseInt(keys[1])
        const field = keys[2]

        const newEnvironmentLogin = [...prev.environmentLogin]
        newEnvironmentLogin[index] = {
          ...newEnvironmentLogin[index],
          [field]: value,
        }

        return {
          ...updated,
          environmentLogin: newEnvironmentLogin,
        }
      }

      // Handle other nested updates
      let current: any = updated
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return updated
    })
  }

  const addLogin = () => {
    setFormData((prev) => ({
      ...prev,
      environmentLogin: [...prev.environmentLogin, { label: "", url: "", id: "", password: "" }],
    }))
  }

  const removeLogin = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      environmentLogin: prev.environmentLogin.filter((_, i) => i !== index),
    }))
  }

  // Safety check - if somehow environmentLogin is not an array, fix it
  if (!Array.isArray(formData.environmentLogin)) {
    console.warn("environmentLogin is not an array, fixing it")
    setFormData((prev) => ({
      ...prev,
      environmentLogin: [{ label: "", url: "", id: "", password: "" }],
    }))
    return null // Return null to prevent render until state is fixed
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/80 to-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0 rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Settings className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  {environment ? "Edit Environment" : "Create New Environment"}
                </CardTitle>
                <CardDescription className="text-blue-100 mt-1">
                  Configure environment details and connection settings
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-white hover:bg-white/20 rounded-xl">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Environment Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g., Production"
                    required
                    className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                    Status
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 rounded-xl focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="active" className="rounded-lg">
                        🟢 Active
                      </SelectItem>
                      <SelectItem value="inactive" className="rounded-lg">
                        🔴 Inactive
                      </SelectItem>
                      <SelectItem value="maintenance" className="rounded-lg">
                        🟡 Maintenance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Environment Login */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Environment Logins</h3>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLogin}
                  className="border-2 border-green-200 text-green-700 hover:bg-green-50 rounded-xl bg-transparent"
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Login
                </Button>
              </div>
              <div className="space-y-4">
                {formData.environmentLogin.map((login, index) => (
                  <div
                    key={index}
                    className="relative bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-100 p-6 rounded-2xl shadow-sm"
                  >
                    {formData.environmentLogin.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLogin(index)}
                        className="absolute top-4 right-4 text-red-500 hover:bg-red-100 rounded-xl"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`login-label-${index}`} className="text-sm font-semibold text-gray-700">
                          Label
                        </Label>
                        <Input
                          id={`login-label-${index}`}
                          value={login.label}
                          onChange={(e) => updateField(`environmentLogin.${index}.label`, e.target.value)}
                          placeholder="e.g., Admin Portal"
                          className="h-11 border-2 border-green-200 rounded-xl focus:border-green-500 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`login-url-${index}`} className="text-sm font-semibold text-gray-700">
                          Login URL
                        </Label>
                        <Input
                          id={`login-url-${index}`}
                          type="url"
                          value={login.url}
                          onChange={(e) => updateField(`environmentLogin.${index}.url`, e.target.value)}
                          placeholder="https://login.company.com/prod"
                          className="h-11 border-2 border-green-200 rounded-xl focus:border-green-500 bg-white"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`login-id-${index}`} className="text-sm font-semibold text-gray-700">
                            Login ID
                          </Label>
                          <Input
                            id={`login-id-${index}`}
                            value={login.id}
                            onChange={(e) => updateField(`environmentLogin.${index}.id`, e.target.value)}
                            placeholder="Login ID"
                            className="h-11 border-2 border-green-200 rounded-xl focus:border-green-500 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`login-password-${index}`} className="text-sm font-semibold text-gray-700">
                            Login Password
                          </Label>
                          <Input
                            id={`login-password-${index}`}
                            type="text"
                            value={login.password}
                            onChange={(e) => updateField(`environmentLogin.${index}.password`, e.target.value)}
                            placeholder="Login password"
                            className="h-11 border-2 border-green-200 rounded-xl focus:border-green-500 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Couchbase Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Couchbase Configuration</h3>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-100 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="couchbaseUrl" className="text-sm font-semibold text-gray-700">
                    Couchbase URL
                  </Label>
                  <Input
                    id="couchbaseUrl"
                    value={formData.couchbase.url}
                    onChange={(e) => updateField("couchbase.url", e.target.value)}
                    placeholder="couchbase://cluster.company.com:8091"
                    className="h-11 border-2 border-orange-200 rounded-xl focus:border-orange-500 bg-white"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="couchbaseId" className="text-sm font-semibold text-gray-700">
                      Couchbase ID
                    </Label>
                    <Input
                      id="couchbaseId"
                      value={formData.couchbase.id}
                      onChange={(e) => updateField("couchbase.id", e.target.value)}
                      placeholder="Couchbase user ID"
                      className="h-11 border-2 border-orange-200 rounded-xl focus:border-orange-500 bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="couchbasePassword" className="text-sm font-semibold text-gray-700">
                      Couchbase Password
                    </Label>
                    <Input
                      id="couchbasePassword"
                      type="text"
                      value={formData.couchbase.password}
                      onChange={(e) => updateField("couchbase.password", e.target.value)}
                      placeholder="Couchbase password"
                      className="h-11 border-2 border-orange-200 rounded-xl focus:border-orange-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Jenkins Pipeline */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                  <GitBranch className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Jenkins Pipeline</h3>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-100 p-6 rounded-2xl shadow-sm">
                <div className="space-y-2">
                  <Label htmlFor="jenkinsUrl" className="text-sm font-semibold text-gray-700">
                    Pipeline URL
                  </Label>
                  <Input
                    id="jenkinsUrl"
                    value={formData.jenkins.pipelineUrl}
                    onChange={(e) => updateField("jenkins.pipelineUrl", e.target.value)}
                    placeholder="https://jenkins.company.com/job/..."
                    className="h-11 border-2 border-purple-200 rounded-xl focus:border-purple-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

            {/* Helm Chart */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Helm Configuration</h3>
              </div>
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-100 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="helmPath" className="text-sm font-semibold text-gray-700">
                    Helm Chart Path
                  </Label>
                  <Input
                    id="helmPath"
                    value={formData.helmChartPath}
                    onChange={(e) => updateField("helmChartPath", e.target.value)}
                    placeholder="/charts/production/app-chart-v2.1.0"
                    className="h-11 border-2 border-teal-200 rounded-xl focus:border-teal-500 bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="helmUpgradeCommand" className="text-sm font-semibold text-gray-700">
                    Helm Upgrade Command
                  </Label>
                  <Input
                    id="helmUpgradeCommand"
                    value={formData.helmUpgradeCommand}
                    onChange={(e) => updateField("helmUpgradeCommand", e.target.value)}
                    placeholder="helm upgrade --install my-app ./my-chart"
                    className="h-11 border-2 border-teal-200 rounded-xl focus:border-teal-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {environment ? "Update Environment" : "Create Environment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
