# How to Use GraphQL API from Backend

This guide explains how to integrate new GraphQL APIs from the backend into the frontend application.

## Overview

This project uses:
- **GraphQL Code Generator** (`@graphql-codegen/cli`) for automatic TypeScript type generation
- **Apollo Client** for GraphQL operations and caching
- **GraphQL Request** for server-side operations

## Step-by-Step Process

### 1. Access GraphQL Playground
Navigate to the backend GraphQL endpoint:
```
http://localhost:7001/graphql
```

### 2. Test Your Query/Mutation
- Write and test your GraphQL operation in the GraphQL Playground
- Make sure it works correctly and returns the expected data
- Copy the final working query/mutation

### 3. Create a .gql File
Create a new `.gql` file in the appropriate module directory:
```
src/api-service/modules/{module-name}/{operation-name}.gql
```

**Example structure:**
```
src/api-service/modules/
├── auth-feature/
│   └── auth/
│       ├── signInByAuth0.gql
│       └── sendResetPasswordLink.gql
├── job-feature/
│   ├── getJobs.gql
│   └── updateJobs.gql
└── user-groups/
    └── getUserGroups.gql
```

**Example .gql file content:**
```graphql
# For queries
query getJobs($input: GetJobsInput!) {
  getJobs(input: $input) {
    data {
      # ... your fields
    }
  }
}

# For mutations
mutation createUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    email
    fullName
  }
}
```

### 4. Update the Schema
Copy the updated schema from GraphQL Playground to:
```
src/api-service/schema.graphqls
```

**Important:** Make sure to include all new types, inputs, and operations in the schema file.

### 5. Generate TypeScript Code
Run the code generator to create TypeScript types and hooks:
```bash
yarn codegen
```

This will generate:
- TypeScript types in `src/api-service/generated/graphql-apollo.generated.tsx`
- GraphQL Request client functions in `src/api-service/generated/graph-ql-client.generated.ts`

### 6. Use the Generated Code

#### For React Components (Client-side)
```typescript
import { graphqlSdk } from '@/api-service';

export async function action() {
  try {
    const result = await graphqlSdk.getJobs({
      input: { /* your input */ }
    });
    return result.getJobs;
  } catch (error) {
    console.error('GraphQL Error:', error);
    throw error;
  }
}
```

## File Organization

- **Queries**: Place in relevant module directories (e.g., `job-feature/getJobs.gql`)
- **Fragments**: Can be shared across multiple operations
- **Subscriptions**: Follow the same module structure

## Best Practices

1. **Naming Convention**: Use descriptive names for operations (`getUserById` not `getUser`)
2. **Module Organization**: Group related operations in the same module directory
3. **Schema Sync**: Always keep `schema.graphqls` up-to-date with the backend
4. **Error Handling**: Always handle loading and error states in components
5. **Type Safety**: Leverage the generated TypeScript types for better development experience

## Troubleshooting

### Common Issues:
- **Schema mismatch**: Make sure `schema.graphqls` matches the backend schema
- **Codegen errors**: Check that all `.gql` files have valid GraphQL syntax
- **Missing types**: Ensure new types are included in the schema file

### Debug Commands:
```bash
# Check for GraphQL syntax errors and generate 
yarn codegen
```

## Configuration

The codegen configuration is in `codegen.ts`:
- **Schema source**: `src/api-service/schema.graphqls`
- **Documents**: All `.gql` files in `src/api-service/modules/**/*.gql`
- **Output**: Generated files in `src/api-service/generated/`