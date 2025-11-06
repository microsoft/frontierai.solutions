param location string
param tags object = {}
param principalId string = ''
param principalType string = 'User'

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(resourceGroup().id, location))

param gptModelName string = 'gpt-4o'
param gptModelVersion string = '2024-08-06'
param gptDeploymentName string = 'gpt-4o'

param openAiModelDeployments array = [
  {
    name: gptDeploymentName
    model: gptModelName
    version: gptModelVersion
    sku: {
      name: 'Standard'
      capacity: 10
    }
  }
  {
    name: 'text-embedding-ada-002'
    model: 'text-embedding-ada-002'
    sku: {
      name: 'Standard'
      capacity: 10
    }
  }
]

// Azure AI Foundry Resource
resource aiFoundry 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: 'aifoundry-${resourceToken}'
  location: location
  tags: tags
  kind: 'AIServices'
  sku: {
    name: 'S0'
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    customSubDomainName: 'aifoundry-${resourceToken}'
    publicNetworkAccess: 'Enabled'
  }

  @batchSize(1)
  resource deployment 'deployments' = [
    for deployment in openAiModelDeployments: {
      name: deployment.name
      sku: deployment.?sku ?? {
        name: 'Standard'
        capacity: 20
      }
      properties: {
        model: {
          format: 'OpenAI'
          name: deployment.model
          version: deployment.?version ?? null
        }
        raiPolicyName: deployment.?raiPolicyName ?? null
        versionUpgradeOption: 'OnceNewDefaultVersionAvailable'
      }
    }
  ]
}

// Azure Speech Service
resource speechService 'Microsoft.CognitiveServices/accounts@2024-10-01' = {
  name: 'speech-${resourceToken}'
  location: location
  tags: tags
  kind: 'SpeechServices'
  sku: {
    name: 'S0'
  }
  properties: {
    customSubDomainName: 'speech-${resourceToken}'
    publicNetworkAccess: 'Enabled'
  }
}

// Log Analytics Workspace
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${abbrs.insightsComponents}${resourceToken}'
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalytics.id
  }
}

// Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-01-01-preview' = {
  name: '${abbrs.containerRegistryRegistries}${resourceToken}'
  location: location
  tags: tags
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
  }
}

// Container Apps Environment
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${abbrs.appManagedEnvironments}${resourceToken}'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// User-Assigned Managed Identity for backend
resource backendIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${abbrs.managedIdentityUserAssignedIdentities}backend-${resourceToken}'
  location: location
  tags: tags
}

// Role Assignment: Cognitive Services User for backend identity
resource cognitiveServicesUserRoleBackend 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(aiFoundry.id, backendIdentity.id, 'CognitiveServicesUser')
  scope: aiFoundry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'a97b65f3-24c7-4388-baec-2e87135dc908')
    principalId: backendIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Role Assignment: Cognitive Services OpenAI User for backend identity
resource cognitiveServicesOpenAIUserRoleBackend 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(aiFoundry.id, backendIdentity.id, 'CognitiveServicesOpenAIUser')
  scope: aiFoundry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'a001fd3d-188f-4b5d-821b-7da978bf7442')
    principalId: backendIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Role Assignment: Cognitive Services User for Speech Service
resource cognitiveServicesUserRoleSpeech 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(speechService.id, backendIdentity.id, 'CognitiveServicesUser')
  scope: speechService
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'a97b65f3-24c7-4388-baec-2e87135dc908')
    principalId: backendIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Role Assignment: Cognitive Services User for principal (developer)
resource cognitiveServicesUserRolePrincipal 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(principalId)) {
  name: guid(aiFoundry.id, principalId, 'CognitiveServicesUser')
  scope: aiFoundry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'a97b65f3-24c7-4388-baec-2e87135dc908')
    principalId: principalId
    principalType: principalType
  }
}

// Role Assignment: Cognitive Services OpenAI User for principal (developer)
resource cognitiveServicesOpenAIUserRolePrincipal 'Microsoft.Authorization/roleAssignments@2022-04-01' = if (!empty(principalId)) {
  name: guid(aiFoundry.id, principalId, 'CognitiveServicesOpenAIUser')
  scope: aiFoundry
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', 'a001fd3d-188f-4b5d-821b-7da978bf7442')
    principalId: principalId
    principalType: principalType
  }
}

// Backend Container App
resource backendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: '${abbrs.appContainerApps}backend-${resourceToken}'
  location: location
  tags: union(tags, { 'azd-service-name': 'backend' })
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${backendIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8000
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'azure-openai-api-key'
          value: aiFoundry.listKeys().key1
        }
        {
          name: 'azure-speech-key'
          value: speechService.listKeys().key1
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json('1.0')
            memory: '2.0Gi'
          }
          env: [
            {
              name: 'PORT'
              value: '8000'
            }
            {
              name: 'ENVIRONMENT'
              value: 'production'
            }
            {
              name: 'AZURE_OPENAI_ENDPOINT'
              value: aiFoundry.properties.endpoint
            }
            {
              name: 'AZURE_OPENAI_API_KEY'
              secretRef: 'azure-openai-api-key'
            }
            {
              name: 'PROJECT_ENDPOINT'
              value: '${aiFoundry.properties.endpoint}api/projects/default-project'
            }
            {
              name: 'MODEL_DEPLOYMENT_NAME'
              value: gptDeploymentName
            }
            {
              name: 'AZURE_SPEECH_KEY'
              secretRef: 'azure-speech-key'
            }
            {
              name: 'AZURE_SPEECH_REGION'
              value: location
            }
            {
              name: 'AZURE_AI_RESOURCE_NAME'
              value: aiFoundry.name
            }
            {
              name: 'AZURE_AI_REGION'
              value: location
            }
            {
              name: 'AZURE_AI_PROJECT_NAME'
              value: 'default-project'
            }
            {
              name: 'SUBSCRIPTION_ID'
              value: subscription().subscriptionId
            }
            {
              name: 'RESOURCE_GROUP_NAME'
              value: resourceGroup().name
            }
            {
              name: 'USE_AZURE_AI_AGENTS'
              value: 'false'
            }
            {
              name: 'AZURE_AVATAR_CHARACTER'
              value: 'lori'
            }
            {
              name: 'AZURE_AVATAR_STYLE'
              value: 'graceful'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

// Frontend Container App
resource frontendApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: '${abbrs.appContainerApps}frontend-${resourceToken}'
  location: location
  tags: union(tags, { 'azd-service-name': 'frontend' })
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: containerRegistry.properties.loginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'registry-password'
        }
      ]
      secrets: [
        {
          name: 'registry-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: 'mcr.microsoft.com/azuredocs/containerapps-helloworld:latest'
          resources: {
            cpu: json('0.5')
            memory: '1.0Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

output AZURE_OPENAI_ENDPOINT string = aiFoundry.properties.endpoint
output AZURE_OPENAI_NAME string = aiFoundry.name
output AZURE_SPEECH_NAME string = speechService.name
output AZURE_SPEECH_REGION string = location
output CONTAINER_REGISTRY_ENDPOINT string = containerRegistry.properties.loginServer
output CONTAINER_REGISTRY_NAME string = containerRegistry.name
output BACKEND_URI string = 'https://${backendApp.properties.configuration.ingress.fqdn}'
output FRONTEND_URI string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'
output BACKEND_IDENTITY_PRINCIPAL_ID string = backendIdentity.properties.principalId
output PROJECT_ENDPOINT string = '${aiFoundry.properties.endpoint}api/projects/default-project'
output AZURE_AI_RESOURCE_NAME string = aiFoundry.name
output MODEL_DEPLOYMENT_NAME string = gptDeploymentName
