import type { Environment } from "@/types/environment"

const STORAGE_KEY = "environments_data"

export const storageService = {
  // Get all environments from localStorage
  getEnvironments(): Environment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
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
    environments.push(environment)
    this.saveEnvironments(environments)
  },

  // Update existing environment
  updateEnvironment(updatedEnvironment: Environment): void {
    const environments = this.getEnvironments()
    const index = environments.findIndex((env) => env.id === updatedEnvironment.id)
    if (index !== -1) {
      environments[index] = updatedEnvironment
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

          // Optional: More robust validation for each environment object
          // For simplicity, we'll assume the structure is correct if it's an array.
          // You might want to add checks for required fields here.

          this.saveEnvironments(parsedData) // Save to localStorage immediately
          resolve(parsedData)
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
