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
import { Save, X } from "lucide-react"

interface EnvironmentFormProps {
  environment?: Environment
  onSave: (environment: Environment) => void
  onCancel: () => void
}

export function EnvironmentForm({ environment, onSave, onCancel }: EnvironmentFormProps) {
  const [formData, setFormData] = useState<Environment>(
    environment || {
      id: crypto.randomUUID(),
      name: "",
      status: "active",
      environmentLogin: {
        url: "",
        id: "",
        password: "",
      },
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
    },
  )

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
      let current: any = updated

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] }
        current = current[keys[i]]
      }

      current[keys[keys.length - 1]] = value
      return updated
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{environment ? "Edit Environment" : "Add New Environment"}</CardTitle>
              <CardDescription>Configure environment details and connection settings</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Environment Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g., Production"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => updateField("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Environment Login */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Environment Login</h3>
              <div className="space-y-2">
                <Label htmlFor="envUrl">Login URL</Label>
                <Input
                  id="envUrl"
                  type="url"
                  value={formData.environmentLogin.url}
                  onChange={(e) => updateField("environmentLogin.url", e.target.value)}
                  placeholder="https://login.company.com/prod"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="envId">Login ID</Label>
                  <Input
                    id="envId"
                    value={formData.environmentLogin.id}
                    onChange={(e) => updateField("environmentLogin.id", e.target.value)}
                    placeholder="Environment login ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="envPassword">Login Password</Label>
                  <Input
                    id="envPassword"
                    type="text" // Changed to text
                    value={formData.environmentLogin.password}
                    onChange={(e) => updateField("environmentLogin.password", e.target.value)}
                    placeholder="Environment password"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Couchbase Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Couchbase Configuration</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="couchbaseUrl">Couchbase URL</Label>
                  <Input
                    id="couchbaseUrl"
                    value={formData.couchbase.url}
                    onChange={(e) => updateField("couchbase.url", e.target.value)}
                    placeholder="couchbase://cluster.company.com:8091"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="couchbaseId">Couchbase ID</Label>
                    <Input
                      id="couchbaseId"
                      value={formData.couchbase.id}
                      onChange={(e) => updateField("couchbase.id", e.target.value)}
                      placeholder="Couchbase user ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="couchbasePassword">Couchbase Password</Label>
                    <Input
                      id="couchbasePassword"
                      type="text" // Changed to text
                      value={formData.couchbase.password}
                      onChange={(e) => updateField("couchbase.password", e.target.value)}
                      placeholder="Couchbase password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Jenkins Pipeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Jenkins Pipeline</h3>
              <div className="space-y-2">
                <Label htmlFor="jenkinsUrl">Pipeline URL</Label>
                <Input
                  id="jenkinsUrl"
                  value={formData.jenkins.pipelineUrl}
                  onChange={(e) => updateField("jenkins.pipelineUrl", e.target.value)}
                  placeholder="https://jenkins.company.com/job/..."
                />
              </div>
            </div>

            <Separator />

            {/* Helm Chart */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Helm Configuration</h3>
              <div className="space-y-2">
                <Label htmlFor="helmPath">Helm Chart Path</Label>
                <Input
                  id="helmPath"
                  value={formData.helmChartPath}
                  onChange={(e) => updateField("helmChartPath", e.target.value)}
                  placeholder="/charts/production/app-chart-v2.1.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="helmUpgradeCommand">Helm Upgrade Command</Label>
                <Input
                  id="helmUpgradeCommand"
                  value={formData.helmUpgradeCommand}
                  onChange={(e) => updateField("helmUpgradeCommand", e.target.value)}
                  placeholder="helm upgrade --install my-app ./my-chart"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
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
