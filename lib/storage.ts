import type { Environment } from "@/types/environment"

const STORAGE_KEY = "environments_data"

// Helper function to normalize environmentLogin to an array
const normalizeEnvironmentLogin = (env: any): Environment => {
  let normalizedLogins: Array<{ label: string; url: string; id: string; password: string }> = []

  if (env.environmentLogin) {
    if (Array.isArray(env.environmentLogin)) {
      normalizedLogins = env.environmentLogin.map((login: any) => ({
        label: login.label || "",
        url: login.url || "",
        id: login.id || "",
        password: login.password || "",
      }))
    } else if (typeof env.environmentLogin === "object" && env.environmentLogin !== null) {
      // If it's a single object (old schema), convert it to an array containing that object
      normalizedLogins = [
        {
          label: env.environmentLogin.label || "",
          url: env.environmentLogin.url || "",
          id: env.environmentLogin.id || "",
          password: env.environmentLogin.password || "",
        },
      ]
    }
  }

  // If we still don't have any logins, add a default one
  if (normalizedLogins.length === 0) {
    normalizedLogins = [{ label: "", url: "", id: "", password: "" }]
  }

  return {
    id: env.id || crypto.randomUUID(),
    name: env.name || "",
    status: env.status || "active",
    environmentLogin: normalizedLogins,
    couchbase: {
      url: env.couchbase?.url || "",
      id: env.couchbase?.id || "sysadmin",
      password: env.couchbase?.password || "Crd!@Mav123",
    },
    jenkins: {
      pipelineUrl: env.jenkins?.pipelineUrl || "",
    },
    helmChartPath: env.helmChartPath || "",
    helmUpgradeCommand: env.helmUpgradeCommand || "",
    createdAt: env.createdAt || new Date().toISOString(),
    updatedAt: env.updatedAt || new Date().toISOString(),
  }
}

export const storageService = {
  // Get all environments from localStorage
  getEnvironments(): Environment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []

      const rawEnvironments = JSON.parse(data)
      if (!Array.isArray(rawEnvironments)) return []

      // Normalize all environments to ensure they have the correct structure
      return rawEnvironments.map(normalizeEnvironmentLogin)
    } catch (error) {
      console.error("Error reading environments from localStorage:", error)
      return []
    }
  },

  // Save environments to localStorage
  saveEnvironments(environments: Environment[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(environments, null, 2))
    } catch (error) {
      console.error("Error saving environments to localStorage:", error)
    }
  },

  // Add new environment
  addEnvironment(environment: Environment): void {
    const environments = this.getEnvironments()
    const normalizedEnvironment = normalizeEnvironmentLogin(environment)
    environments.push(normalizedEnvironment)
    this.saveEnvironments(environments)
  },

  // Update existing environment
  updateEnvironment(updatedEnvironment: Environment): void {
    const environments = this.getEnvironments()
    const index = environments.findIndex((env) => env.id === updatedEnvironment.id)
    if (index !== -1) {
      const normalizedEnvironment = normalizeEnvironmentLogin(updatedEnvironment)
      environments[index] = normalizedEnvironment
      this.saveEnvironments(environments)
    }
  },

  // Delete environment
  deleteEnvironment(id: string): void {
    const environments = this.getEnvironments()
    const filtered = environments.filter((env) => env.id !== id)
    this.saveEnvironments(filtered)
  },

  /**
   * Downloads the given environments array as a JSON file.
   * This simulates "creating a file locally" by prompting the user to save it.
   */
  downloadEnvironments(environments: Environment[], filename = "environments.json"): void {
    const jsonString = JSON.stringify(environments, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  /**
   * Reads and parses a JSON file from a File object.
   * Returns a Promise that resolves with the parsed data or rejects on error.
   */
  uploadEnvironments(file: File): Promise<Environment[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const parsedData = JSON.parse(content)

          // Basic validation: check if it's an array
          if (!Array.isArray(parsedData)) {
            throw new Error("Invalid JSON format: Expected an array of environments.")
          }

          // Normalize all uploaded environments
          const normalizedData = parsedData.map(normalizeEnvironmentLogin)

          this.saveEnvironments(normalizedData) // Save to localStorage immediately
          resolve(normalizedData)
        } catch (error) {
          console.error("Error parsing uploaded JSON file:", error)
          reject(new Error("Failed to parse JSON file. Please ensure it's a valid format."))
        }
      }

      reader.onerror = (error) => {
        console.error("Error reading file:", error)
        reject(new Error("Failed to read file."))
      }

      reader.readAsText(file)
    })
  },
}
