#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { GraphQLClient, gql } from 'graphql-request';
import { z } from 'zod';

const RAILWAY_API_ENDPOINT = 'https://backboard.railway.app/graphql/v2';

// --- Type Definitions based on Railway API ---

interface Variable {
    name: string;
    value: string;
}

interface Service {
    id: string;
    name: string;
}

interface Environment {
    id: string;
    name: string;
}

interface Project {
    id: string;
    name: string;
    description: string;
    environments: { edges: { node: Environment }[] };
    services: { edges: { node: Service }[] };
}

interface Deployment {
    id: string;
    status: string;
    url: string;
    createdAt: string;
}

// --- GraphQL Queries ---

const GET_PROJECTS_QUERY = gql`
  query GetProjects {
    projects {
      edges {
        node {
          id
          name
          description
          environments {
            edges {
              node {
                id
                name
              }
            }
          }
          services {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

const UPSERT_VARIABLES_MUTATION = gql`
  mutation UpsertVariables($projectId: String!, $serviceId: String!, $environmentId: String!, $variables: [VariableInput!]!) {
    variableCollectionUpsert(input: { projectId: $projectId, serviceId: $serviceId, environmentId: $environmentId, variables: $variables })
  }
`;

const DEPLOY_SERVICE_MUTATION = gql`
  mutation DeployService($serviceId: String!, $environmentId: String!) {
    serviceInstanceDeploy(input: { serviceId: $serviceId, environmentId: $environmentId }) {
       id
    }
  }
`;

const GET_DEPLOYMENT_QUERY = gql`
    query GetDeployment($id: String!) {
        deployment(id: $id) {
            id
            status
            url
            createdAt
        }
    }
`;


// --- Server Implementation ---

class RailwayMcpServer {
    private server: Server;
    private client: GraphQLClient | null = null;

    constructor() {
        this.server = new Server(
            {
                name: 'railway-mcp',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupHandlers();
    }

    private getClient(): GraphQLClient {
        if (this.client) return this.client;

        const token = process.env.RAILWAY_API_TOKEN;
        if (!token) {
            throw new McpError(ErrorCode.InvalidRequest, 'RAILWAY_API_TOKEN environment variable is not set');
        }

        this.client = new GraphQLClient(RAILWAY_API_ENDPOINT, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return this.client;
    }

    private setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'railway_list_projects',
                    description: 'List all Railway projects, environments, and services accessible by the token.',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'railway_upsert_variables',
                    description: 'Upsert environment variables for a specific service in a project environment.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            projectId: { type: 'string', description: 'The Project ID' },
                            serviceId: { type: 'string', description: 'The Service ID' },
                            environmentId: { type: 'string', description: 'The Environment ID (e.g., production)' },
                            variables: {
                                type: 'object',
                                description: 'Key-value pairs of variables to upsert',
                                additionalProperties: { type: 'string' },
                            },
                        },
                        required: ['projectId', 'serviceId', 'environmentId', 'variables'],
                    },
                },
                {
                    name: 'railway_deploy',
                    description: 'Trigger a new deployment for a service.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            serviceId: { type: 'string' },
                            environmentId: { type: 'string' }
                        },
                        required: ['serviceId', 'environmentId']
                    }
                },
                {
                    name: 'railway_get_deployment',
                    description: 'Get status and URL of a specific deployment.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            deploymentId: { type: 'string' }
                        },
                        required: ['deploymentId']
                    }
                }
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const client = this.getClient();

            try {
                switch (request.params.name) {
                    case 'railway_list_projects': {
                        const data: any = await client.request(GET_PROJECTS_QUERY);
                        // Transform for cleaner output
                        const projects = data.projects.edges.map((edge: any) => {
                            const p = edge.node;
                            return {
                                id: p.id,
                                name: p.name,
                                description: p.description,
                                environments: p.environments.edges.map((e: any) => ({ id: e.node.id, name: e.node.name })),
                                services: p.services.edges.map((s: any) => ({ id: s.node.id, name: s.node.name }))
                            };
                        });
                        return {
                            content: [{ type: 'text', text: JSON.stringify(projects, null, 2) }],
                        };
                    }

                    case 'railway_upsert_variables': {
                        const { projectId, serviceId, environmentId, variables } = request.params.arguments as any;
                        const variableInputs = Object.entries(variables).map(([key, value]) => ({
                            name: key,
                            value: String(value)
                        }));

                        await client.request(UPSERT_VARIABLES_MUTATION, {
                            projectId,
                            serviceId,
                            environmentId,
                            variables: variableInputs
                        });

                        return {
                            content: [{ type: 'text', text: `Successfully upserted ${variableInputs.length} variables.` }],
                        };
                    }

                    case 'railway_deploy': {
                        const { serviceId, environmentId } = request.params.arguments as any;
                        const data: any = await client.request(DEPLOY_SERVICE_MUTATION, { serviceId, environmentId });
                        return {
                            content: [{ type: 'text', text: JSON.stringify(data.serviceInstanceDeploy, null, 2) }]
                        };
                    }

                    case 'railway_get_deployment': {
                        const { deploymentId } = request.params.arguments as any;
                        const data: any = await client.request(GET_DEPLOYMENT_QUERY, { id: deploymentId });
                        return {
                            content: [{ type: 'text', text: JSON.stringify(data.deployment, null, 2) }]
                        };
                    }

                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            } catch (error: any) {
                // Redact potential secrets from error message if possible
                const errorMessage = error instanceof Error ? error.message : String(error);
                return {
                    content: [{ type: 'text', text: `Railway API Error: ${errorMessage}` }],
                    isError: true,
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Railway MCP Server running on stdio');
    }
}

const server = new RailwayMcpServer();
server.run().catch(console.error);
