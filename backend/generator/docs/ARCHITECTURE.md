# Architecture: MCP Server Generator

## System Overview
The MCP Server Generator is a specialized service designed to create production-ready Model Context Protocol (MCP) servers. It translates natural language tool descriptions into structured, compliance-checked source code compatible with the `@modelcontextprotocol/sdk`.

## Component Architecture
The generator is a self-contained TypeScript module that handles the transformation from user input to a full project structure.

### Logical Components

1.  **Input Normalizer**:
    *   Validates input descriptions.
    *   Sanitizes tool names and project identifiers.
    *   Determines complexity and required dependencies.

2.  **Template Engine**:
    *   Uses structured string-literal templates to emit TypeScript code.
    *   Generates configuration files (`package.json`, `tsconfig.json`, `.env.example`).
    *   Generates deployment artifacts (`Dockerfile`, `manifest.json`).

3.  **Validation Layer**:
    *   Leverages Zod for schema enforcement in the generated server.
    *   Ensures the generated code follows secure coding patterns.

## Data Flow

### Generator Internal Flow
```puml
@startuml
package "MCP Generator Service" {
    [Input Manager] as IN
    [Template Engine] as TEMPL
    [Output Formatter] as OUT
}

database "Template Library" as LIB

IN -[#blue]-> TEMPL : "Sanitized Description"
LIB -[#green]-> TEMPL : "Base Templates"
TEMPL -[#red]-> OUT : "Source Code Chunks"
OUT -[#orange]-> [Generated MCP Project] : "Emit Files"

note right of TEMPL : Applies security policies\\nand best practices
@enduml
```

### Agentic Generation (Day 2 Integration)
Starting with Day 2, the generator supports agentic code generation via IBM Bob. This layer sits on top of the template engine, providing dynamic tool implementation logic while maintaining the template engine as a safety fallback.

```puml
@startuml
package "MCP Generator Service" {
    [Input Normalizer] as IN
    [Bob Factory] as FACTORY
    [Bob Client] as CLIENT
    [Bob Validator] as VAL
    [Bob Adapter] as ADAPT
    [Template Engine] as TEMPL
}

IN -> FACTORY : "Request"
FACTORY -> CLIENT : "Invoke (Mock or Real)"
CLIENT -> VAL : "Raw AI Response"
VAL -> ADAPT : "Validated Content"
ADAPT -> TEMPL : "Inject dynamic snippets"
TEMPL -> [Generated Project] : "Emit Files"

node "IBM Bob API" as BOB
CLIENT <..> BOB : "Async JSON-RPC"
@enduml
```

### Lifecycle of a Generated Server
```puml
@startuml
actor "Developer / LLM" as DEV
participant "MCP Generator" as GEN
participant "Build System" as BLD
participant "MCP Host (Claude / Antigravity)" as HOST

DEV -> GEN : Provide tool description
GEN -> GEN : Apply templates & logic
GEN --> DEV : Emit project files
DEV -> BLD : npm install && npm run build
BLD -> DEV : dist/server.js
DEV -> HOST : Register server (stdio)
HOST -> DEV : Invoke Tool via MCP
@enduml
```

## Implementation Details
*   **Transport**: Generated servers default to `stdio` transport for maximum compatibility.
*   **Language**: Strictly uses TypeScript (ESM) for the generated projects.
*   **Standards**: Follows the official Model Context Protocol specification for tool definition and communication.
*   **Validation**: Built-in Zod validation for all tool inputs in the generated code.