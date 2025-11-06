targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Id of the user or app to assign application roles')
param principalId string = ''

@description('Type of the principal (User or ServicePrincipal)')
param principalType string = 'User'

var abbrs = loadJsonContent('./abbreviations.json')
var tags = { 'azd-env-name': environmentName }

resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

module resources './resources.bicep' = {
  name: 'resources'
  scope: rg
  params: {
    location: location
    tags: tags
    principalId: principalId
    principalType: principalType
  }
}

output AZURE_LOCATION string = location
output AZURE_CONTAINER_REGISTRY_ENDPOINT string = resources.outputs.CONTAINER_REGISTRY_ENDPOINT
output AZURE_CONTAINER_REGISTRY_NAME string = resources.outputs.CONTAINER_REGISTRY_NAME
output AZURE_OPENAI_ENDPOINT string = resources.outputs.AZURE_OPENAI_ENDPOINT
output AZURE_OPENAI_NAME string = resources.outputs.AZURE_OPENAI_NAME
output AZURE_SPEECH_NAME string = resources.outputs.AZURE_SPEECH_NAME
output AZURE_SPEECH_REGION string = resources.outputs.AZURE_SPEECH_REGION
output BACKEND_URI string = resources.outputs.BACKEND_URI
output FRONTEND_URI string = resources.outputs.FRONTEND_URI
output BACKEND_IDENTITY_PRINCIPAL_ID string = resources.outputs.BACKEND_IDENTITY_PRINCIPAL_ID
output PROJECT_ENDPOINT string = resources.outputs.PROJECT_ENDPOINT
output AZURE_AI_RESOURCE_NAME string = resources.outputs.AZURE_AI_RESOURCE_NAME
output MODEL_DEPLOYMENT_NAME string = resources.outputs.MODEL_DEPLOYMENT_NAME
