export interface Environment {
  id: string
  name: string
  status: "active" | "inactive" | "maintenance"
  environmentLogin: Array<{
    // Changed to array
    label: string // Added label
    url: string
    id: string
    password: string
  }>
  couchbase: {
    url: string
    id: string
    password: string
  }
  jenkins: {
    pipelineUrl: string
  }
  helmChartPath: string
  helmUpgradeCommand: string
  createdAt: string
  updatedAt: string
}
