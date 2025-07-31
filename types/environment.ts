export interface Environment {
  id: string
  name: string
  status: "active" | "inactive" | "maintenance"
  environmentLogin: {
    url: string
    id: string
    password: string
  }
  couchbase: {
    url: string
    id: string
    password: string
  }
  jenkins: {
    pipelineUrl: string
    // Removed jobName
  }
  helmChartPath: string
  helmUpgradeCommand: string // Added new field
  createdAt: string
  updatedAt: string
}
