import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import os from "os";
import { exec } from "child_process";
import fs from "fs/promises";
import { createProxyMiddleware } from "http-proxy-middleware";
dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);

// Initialize Google Gen AI server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();

  // API Route: Check environment & health
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      hasApiKey: !!process.env.GEMINI_API_KEY,
    });
  });

  // Debug endpoint: accept base64 PDF and write to disk (dev only)
  app.post(
    "/api/debug-pdf",
    express.json({ limit: "100mb" }),
    async (req, res) => {
      try {
        const { base64, filename } = req.body as {
          base64?: string;
          filename?: string;
        };
        if (!base64) {
          res.status(400).json({ error: "Missing base64 payload" });
          return;
        }

        const dir = path.join(process.cwd(), "debug_exports");
        await fs.mkdir(dir, { recursive: true });
        const safeName = (filename || `export_${Date.now()}.pdf`).replace(
          /[^a-z0-9A-Z._-]/g,
          "_",
        );
        const filePath = path.join(dir, safeName);
        const buffer = Buffer.from(base64, "base64");
        await fs.writeFile(filePath, buffer);
        console.log("Saved debug PDF:", filePath);
        res.json({ saved: filePath });
      } catch (err) {
        console.error("Failed to save debug PDF:", err);
        res.status(500).json({ error: String(err) });
      }
    },
  );

  // Font proxy to avoid CORS when fetching TTF files from upstream sources
  app.get("/api/font/:fontName", async (req, res) => {
    try {
      const { fontName } = req.params;
      const fontMap: Record<string, string> = {
        "roboto-regular":
          "https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Regular.ttf",
        "roboto-bold":
          "https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Bold.ttf",
        "roboto-italic":
          "https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Italic.ttf",
        "roboto-bolditalic":
          "https://github.com/google/fonts/raw/main/apache/roboto/Roboto-BoldItalic.ttf",
      };

      const url = fontMap[fontName];
      if (!url) {
        res.status(404).send("Unknown font");
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        res.status(502).send("Failed to fetch font");
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.setHeader("Content-Type", "font/ttf");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(buffer);
    } catch (err) {
      console.error("Font proxy error:", err);
      res.status(500).send("Font proxy error");
    }
  });

  // API Route: Transform product idea into planning system artifacts
  app.post(
    "/api/generate",
    express.json({ limit: "10mb" }),
    async (req, res) => {
      try {
        const { idea, artifactType, currentContext, extraDetails } = req.body;

        if (!idea || !idea.trim()) {
          res.status(400).json({ error: "Product idea is required" });
          return;
        }

        if (!process.env.GEMINI_API_KEY) {
          res.status(500).json({
            error:
              "GEMINI_API_KEY is not configured. Please add it to the Secrets panel in the Settings menu.",
          });
          return;
        }

        // We'll use "gemini-3.5-flash" as the basic/complex text tasks model.
        const modelName = "gemini-3.5-flash";

        let prompt = ``;
        let systemInstruction = `You are an elite, multi-disciplinary Principal Product Manager, Systems Architect, Enterprise Business Analyst, and Software Development Lead.
Your goal is to transform a raw product idea into detailed, hyper-realistic, production-ready product artifacts.`;

        if (artifactType === "overview") {
          prompt = `Analyze this product idea: "${idea}"
Generate a structured JSON configuration containing high-level planning.
Provide:
1. elevatorPitch: A compelling 1-line elevator pitch.
2. targetAudience: An array of target user groups.
3. coreValueProp: A concise paragraph on the core value proposition.
4. modules: An array of key functional modules or epics of the app (e.g. Auth, Scheduling, Analytics). Include 'name', 'description', and 'estimatedComplexity' (Low/Medium/High).
5. techStackSuggested: Suggest a modern tech stack (Frontend, Backend, Database, Auth, Hosting).
6. feasibilityScore: A percentage number reflecting engineering feasibility.
7. primaryChallenge: A short description of the biggest technical or product challenge to address.
8. monetizationSuggestions: List 2 or 3 potential monetization models applicable.

Return ONLY a JSON object matching this TypeScript structure:
{
  "elevatorPitch": string,
  "targetAudience": string[],
  "coreValueProp": string,
  "modules": Array<{ name: string, description: string, estimatedComplexity: "Low" | "Medium" | "High" }>,
  "techStackSuggested": { frontend: string, backend: string, database: string, auth: string, hosting: string },
  "feasibilityScore": number,
  "primaryChallenge": string,
  "monetizationSuggestions": string[]
}`;

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  elevatorPitch: { type: Type.STRING },
                  targetAudience: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  coreValueProp: { type: Type.STRING },
                  modules: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        estimatedComplexity: { type: Type.STRING },
                      },
                      required: ["name", "description", "estimatedComplexity"],
                    },
                  },
                  techStackSuggested: {
                    type: Type.OBJECT,
                    properties: {
                      frontend: { type: Type.STRING },
                      backend: { type: Type.STRING },
                      database: { type: Type.STRING },
                      auth: { type: Type.STRING },
                      hosting: { type: Type.STRING },
                    },
                    required: [
                      "frontend",
                      "backend",
                      "database",
                      "auth",
                      "hosting",
                    ],
                  },
                  feasibilityScore: { type: Type.NUMBER },
                  primaryChallenge: { type: Type.STRING },
                  monetizationSuggestions: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  "elevatorPitch",
                  "targetAudience",
                  "coreValueProp",
                  "modules",
                  "techStackSuggested",
                  "feasibilityScore",
                  "primaryChallenge",
                  "monetizationSuggestions",
                ],
              },
            },
          });

          // Safely parse the model response. Some model outputs may include
          // trailing commentary or be malformed JSON; attempt a best-effort
          // parse and fall back to returning the raw text for debugging.
          let parsedOutput: any = null;
          const raw = response.text || "";
          try {
            parsedOutput = JSON.parse(raw || "{}");
          } catch (err) {
            console.warn("Gemini response JSON parse failed:", err);
            // Try to extract a JSON substring between first '{' and last '}'
            try {
              const first = raw.indexOf("{");
              const last = raw.lastIndexOf("}");
              if (first !== -1 && last !== -1 && last > first) {
                const candidate = raw.substring(first, last + 1);
                parsedOutput = JSON.parse(candidate);
              } else {
                parsedOutput = { _raw: raw };
              }
            } catch (err2) {
              console.warn("Fallback JSON extraction failed:", err2);
              parsedOutput = { _raw: raw };
            }
          }

          res.json({ output: parsedOutput });
          return;
        }

        if (artifactType === "prd") {
          prompt = `Generate a highly professional Product Requirements Document (PRD) for the product idea: "${idea}"
Context: ${JSON.stringify(currentContext || {})}
Extra input details: ${extraDetails || "None"}

Please structure the PRD beautifully in Markdown. Make sure to cover:
1. Executive Summary & Core Definitions
2. Goals and Non-Goals
3. User Personas (minimum 2 detailed personas)
4. Functional Requirements (detailed tables with Priority (P0/P1/P2), Impact, and Scope)
5. Non-Functional Requirements (Performance, Security, Quality, Scale)
6. Out-of-Scope Items for Phase 1 MVP
7. Success Metrics & KPIs

Be detailed, technical, realistic and thorough. Do not use generic placeholders.`;

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { systemInstruction },
          });

          res.json({ output: response.text });
          return;
        }

        if (artifactType === "userStories") {
          prompt = `Generate a sequence of Sprint Plans and User Stories for: "${idea}"
Context: ${JSON.stringify(currentContext || {})}
Extra inputs: ${extraDetails || "None"}

Generate a structured JSON configuration of user stories grouped by Epic/Sprint.
Provide:
- A title or sprint number
- An array of stories, where each story has:
  1. id (e.g. STORY-101)
  2. title: short descriptive title
  3. role: user role (As a...)
  4. want: functional expectation (I want to...)
  5. benefit: user value (so that...)
  6. state: "Sprint Backlog" | "In Progress" | "Done"
  7. priority: "High" | "Medium" | "Low"
  8. storyPoints: number (1, 2, 3, 5, 8)
  9. acceptanceCriteria: list of string rules for acceptance
  10. notes: additional design or technical notes

Return ONLY a JSON array matching this structure:
Array<{
  sprintName: string,
  focus: string,
  stories: Array<{
    id: string,
    title: string,
    role: string,
    want: string,
    benefit: string,
    priority: "High" | "Medium" | "Low",
    storyPoints: number,
    acceptanceCriteria: string[],
    notes?: string
  }>
}>`;

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sprintName: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    stories: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          title: { type: Type.STRING },
                          role: { type: Type.STRING },
                          want: { type: Type.STRING },
                          benefit: { type: Type.STRING },
                          priority: { type: Type.STRING },
                          storyPoints: { type: Type.NUMBER },
                          acceptanceCriteria: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          notes: { type: Type.STRING },
                        },
                        required: [
                          "id",
                          "title",
                          "role",
                          "want",
                          "benefit",
                          "priority",
                          "storyPoints",
                          "acceptanceCriteria",
                        ],
                      },
                    },
                  },
                  required: ["sprintName", "focus", "stories"],
                },
              },
            },
          });

          res.json({ output: JSON.parse(response.text || "[]") });
          return;
        }

        if (artifactType === "databaseSchema") {
          prompt = `Generate a Database Schema (Data Models and Relationships) for: "${idea}"
Context: ${JSON.stringify(currentContext || {})}
Extra inputs: ${extraDetails || "None"}

Please output a structured JSON representing database tables/collections, fields, primary/foreign keys, indexes, and a description.
Provide details for Relational (SQL) and Document (NoSQL - Firestore/MongoDB) styles.
Structure needed:
{
  "databaseParadigm": string, // "SQL relational" or "Document NoSQL" or "Hybrid"
  "tables": Array<{
    tableName: string,
    description: string,
    fields: Array<{ name: string, type: string, constraints?: string, description: string }>,
    primaryKey?: string,
    foreignKeys?: Array<{ field: string, referencesTable: string, referencesField: string }>,
    indexes?: string[]
  }>,
  "relationshipsDescription": string // Markdown string summarizing database joins and cardinailities
}

Return ONLY a JSON matching the requested schema.`;

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  databaseParadigm: { type: Type.STRING },
                  tables: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        tableName: { type: Type.STRING },
                        description: { type: Type.STRING },
                        fields: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              type: { type: Type.STRING },
                              constraints: { type: Type.STRING },
                              description: { type: Type.STRING },
                            },
                            required: ["name", "type", "description"],
                          },
                        },
                        primaryKey: { type: Type.STRING },
                        foreignKeys: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              field: { type: Type.STRING },
                              referencesTable: { type: Type.STRING },
                              referencesField: { type: Type.STRING },
                            },
                            required: [
                              "field",
                              "referencesTable",
                              "referencesField",
                            ],
                          },
                        },
                        indexes: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ["tableName", "description", "fields"],
                    },
                  },
                  relationshipsDescription: { type: Type.STRING },
                },
                required: [
                  "databaseParadigm",
                  "tables",
                  "relationshipsDescription",
                ],
              },
            },
          });

          res.json({ output: JSON.parse(response.text || "{}") });
          return;
        }

        if (artifactType === "uiWireframe") {
          prompt = `Generate a UI Wireframe layout config and detailed concept for: "${idea}"
Context: ${JSON.stringify(currentContext || {})}
Extra details: ${extraDetails || "None"}

Please design the primary MVP screen layout structure logically so we can render it dynamically inside a layout canvas. We need:
1. screenName: descriptive name of the primary screen (e.g. "Main Analytics Dashboard")
2. UXHighlights: Highlights of the UI usability decisions.
3. layoutRows: An array of layout elements that simulate a web/mobile grid.
Each row should contain elements. Element types can be: 'header', 'sidebar', 'hero_card', 'chart_card', 'data_table', 'form', 'stat_badge', 'button', 'input_field', 'list_item'.
Each element should have: 'type', 'label', 'widthSpan' (1-4 on a 4-column scale), 'heightPx' (approx height, 40 to 400), 'placeholderText' (if relevant), and 'purpose'.

Return ONLY a JSON object matching this structure:
{
  "screenName": string,
  "UXHighlights": string[],
  "layoutRows": Array<{
    rowId: string,
    colSpan: number, // total columns in this row (typically 4)
    elements: Array<{
      id: string,
      type: "header" | "sidebar" | "hero_card" | "chart_card" | "data_table" | "form" | "stat_badge" | "button" | "input_field" | "list_item",
      label: string,
      widthSpan: number, // on a 4-column base (1, 2, 3, or 4)
      heightPx: number,
      placeholderText?: string,
      purpose: string
    }>
  }>
}`;

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  screenName: { type: Type.STRING },
                  UXHighlights: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  layoutRows: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        rowId: { type: Type.STRING },
                        colSpan: { type: Type.NUMBER },
                        elements: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              id: { type: Type.STRING },
                              type: { type: Type.STRING },
                              label: { type: Type.STRING },
                              widthSpan: { type: Type.NUMBER },
                              heightPx: { type: Type.NUMBER },
                              placeholderText: { type: Type.STRING },
                              purpose: { type: Type.STRING },
                            },
                            required: [
                              "id",
                              "type",
                              "label",
                              "widthSpan",
                              "heightPx",
                              "purpose",
                            ],
                          },
                        },
                      },
                      required: ["rowId", "colSpan", "elements"],
                    },
                  },
                },
                required: ["screenName", "UXHighlights", "layoutRows"],
              },
            },
          });

          res.json({ output: JSON.parse(response.text || "{}") });
          return;
        }

        if (artifactType === "apiStructure") {
          prompt = `Generate a RESTful API Endpoint Structure and Specification for: "${idea}"
Context: ${JSON.stringify(currentContext || {})}
Extra details: ${extraDetails || "None"}

Produce a beautifully structured specification in JSON.
Include:
- Service base description (e.g., base URL recommendations)
- Endpoints array:
  - id (e.g. API-1)
  - method (GET, POST, PATCH, DELETE)
  - path (e.g. /api/v1/workspaces)
  - description
  - authenticationRequired (boolean)
  - queryParams: Array of { name, type, description, required }
  - requestBody: descriptive JSON string (or null)
  - successResponse: descriptive JSON string of standard status code & response

Return ONLY JSON matching this structure:
{
  "baseUrl": string,
  "endpoints": Array<{
    id: string,
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    description: string,
    authenticationRequired: boolean,
    queryParams?: Array<{ name: string, type: string, description: string, required: boolean }>,
    requestBody?: string,
    successResponse: string
  }>
}`;

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  baseUrl: { type: Type.STRING },
                  endpoints: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        method: { type: Type.STRING },
                        path: { type: Type.STRING },
                        description: { type: Type.STRING },
                        authenticationRequired: { type: Type.BOOLEAN },
                        queryParams: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              type: { type: Type.STRING },
                              description: { type: Type.STRING },
                              required: { type: Type.BOOLEAN },
                            },
                            required: [
                              "name",
                              "type",
                              "description",
                              "required",
                            ],
                          },
                        },
                        requestBody: { type: Type.STRING },
                        successResponse: { type: Type.STRING },
                      },
                      required: [
                        "id",
                        "method",
                        "path",
                        "description",
                        "authenticationRequired",
                        "successResponse",
                      ],
                    },
                  },
                },
                required: ["baseUrl", "endpoints"],
              },
            },
          });

          res.json({ output: JSON.parse(response.text || "{}") });
          return;
        }

        if (artifactType === "developmentRoadmap") {
          prompt = `Generate a modern vertical Development Roadmap timeline for: "${idea}"
Context: ${JSON.stringify(currentContext || {})}
Extra inputs: ${extraDetails || "None"}

Please produce a highly detailed, professional sequence of launch phases. Mapped JSON structure:
Array<{
  phaseNumber: number,
  phaseTitle: string,
  durationWeeks: string,
  milestone: string,
  coreObjectives: string[],
  detailedTasks: string[],
  readinessCriteria: string[]
}>

Return ONLY a JSON matching the requested structure.`;

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phaseNumber: { type: Type.NUMBER },
                    phaseTitle: { type: Type.STRING },
                    durationWeeks: { type: Type.STRING },
                    milestone: { type: Type.STRING },
                    coreObjectives: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    detailedTasks: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    readinessCriteria: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: [
                    "phaseNumber",
                    "phaseTitle",
                    "durationWeeks",
                    "milestone",
                    "coreObjectives",
                    "detailedTasks",
                    "readinessCriteria",
                  ],
                },
              },
            },
          });

          res.json({ output: JSON.parse(response.text || "[]") });
          return;
        }

        if (artifactType === "starterCode") {
          // Here we'll generate realistic Express.ts or Python Fast API starter code matching the product context
          prompt = `You are a Principal Software Engineer.
Generate three primary code files as professional starter code for: "${idea}"
Context: ${JSON.stringify(currentContext || {})}
Extra details (e.g. language or frameworks): ${extraDetails || "Standard Node/TypeScript backend & React mockup"}

Please output exactly three highly clean, complete code files.
For each file provide:
1. filePath: descriptive target file path (e.g., 'src/server.ts', 'src/models/User.ts', 'src/components/Dashboard.tsx')
2. language: 'typescript' | 'javascript' | 'python' | 'html' | 'css'
3. codeDescription: what this file implements and guides
4. codeContent: the complete, beautifully structured, syntactically correct code contents.

Return ONLY a JSON object of this structure:
{
  "starterFiles": Array<{
    filePath: string,
    language: string,
    codeDescription: string,
    codeContent: string
  }>
}`;

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  starterFiles: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        filePath: { type: Type.STRING },
                        language: { type: Type.STRING },
                        codeDescription: { type: Type.STRING },
                        codeContent: { type: Type.STRING },
                      },
                      required: [
                        "filePath",
                        "language",
                        "codeDescription",
                        "codeContent",
                      ],
                    },
                  },
                },
                required: ["starterFiles"],
              },
            },
          });

          res.json({ output: JSON.parse(response.text || "{}") });
          return;
        }

        res
          .status(400)
          .json({ error: `Unsupported artifactType: ${artifactType}` });
      } catch (err: any) {
        console.error("Gemini Generation Error:", err);
        res.status(500).json({
          error:
            err.message ||
            "An unexpected error occurred during planning orchestration.",
        });
      }
    },
  );

  // --- REVERSE PROXY FOR NEXT.JS LANDING PAGE ---
  // Only enable this while developing locally. In production the landing app
  // is deployed separately on Vercel, so forwarding to localhost would fail.
  if (process.env.NODE_ENV !== "production") {
    const nextProxy = createProxyMiddleware({
      target: "http://localhost:3001",
      changeOrigin: true,
    });

    app.use((req, res, next) => {
      if (
        req.path === "/" ||
        req.path === "/login" ||
        req.path === "/register" ||
        req.path.startsWith("/_next") ||
        req.path.startsWith("/api/auth")
      ) {
        nextProxy(req, res, next);
      } else {
        next();
      }
    });
  }

  // Serve static assets from index.html in production, fallback path
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    const localUrl = `http://localhost:${PORT}`;

    // determine a likely LAN IP for display
    const nets = os.networkInterfaces();
    let lanIp: string | null = null;
    for (const name of Object.keys(nets)) {
      for (const net of nets[name] || []) {
        if (net.family === "IPv4" && !net.internal) {
          lanIp = net.address;
          break;
        }
      }
      if (lanIp) break;
    }

    console.log(`AI PM Platform Server running on port ${PORT}`);
    console.log(
      `Local: ${localUrl}` +
        (lanIp ? `  Network: http://${lanIp}:${PORT}` : ""),
    );

    // Optionally open the browser when OPEN_BROWSER=true
    if (process.env.OPEN_BROWSER === "true") {
      const urlToOpen = localUrl;
      const platform = process.platform;
      let cmd = null;
      if (platform === "win32") cmd = `start "" "${urlToOpen}"`;
      else if (platform === "darwin") cmd = `open "${urlToOpen}"`;
      else cmd = `xdg-open "${urlToOpen}"`;

      if (cmd) {
        exec(cmd, (err) => {
          if (err) console.error("Failed to open browser:", err);
        });
      }
    }
  });

  // Graceful shutdown to prevent EADDRINUSE on restarts
  const gracefulShutdown = () => {
    console.log("Shutting down servers gracefully...");
    server.close(() => {
      console.log("Closed all connections.");
      process.exit(0);
    });

    // Force close after 5s
    setTimeout(() => {
      console.error("Forcefully shutting down");
      process.exit(1);
    }, 5000);
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
}

startServer();
