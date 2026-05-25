export interface Module {
  name: string;
  description: string;
  estimatedComplexity: "Low" | "Medium" | "High";
}

export interface TechStackSuggested {
  frontend: string;
  backend: string;
  database: string;
  auth: string;
  hosting: string;
}

export interface ProjectOverview {
  elevatorPitch: string;
  targetAudience: string[];
  coreValueProp: string;
  modules: Module[];
  techStackSuggested: TechStackSuggested;
  feasibilityScore: number;
  primaryChallenge: string;
  monetizationSuggestions: string[];
}

export interface UserStory {
  id: string;
  title: string;
  role: string;
  want: string;
  benefit: string;
  priority: "High" | "Medium" | "Low";
  storyPoints: number;
  acceptanceCriteria: string[];
  notes?: string;
}

export interface SprintPlan {
  sprintName: string;
  focus: string;
  stories: UserStory[];
}

export interface SchemaField {
  name: string;
  type: string;
  constraints?: string;
  description: string;
}

export interface SchemaForeignKey {
  field: string;
  referencesTable: string;
  referencesField: string;
}

export interface DatabaseTable {
  tableName: string;
  description: string;
  fields: SchemaField[];
  primaryKey?: string;
  foreignKeys?: SchemaForeignKey[];
  indexes?: string[];
}

export interface DatabaseSchema {
  databaseParadigm: string;
  tables: DatabaseTable[];
  relationshipsDescription: string;
}

export interface LayoutElement {
  id: string;
  type: "header" | "sidebar" | "hero_card" | "chart_card" | "data_table" | "form" | "stat_badge" | "button" | "input_field" | "list_item";
  label: string;
  widthSpan: number; // 1 to 4 span on a Col base
  heightPx: number;
  placeholderText?: string;
  purpose: string;
}

export interface LayoutRow {
  rowId: string;
  colSpan: number;
  elements: LayoutElement[];
}

export interface UIWireframeConfig {
  screenName: string;
  UXHighlights: string[];
  layoutRows: LayoutRow[];
}

export interface APIQueryParam {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

export interface APIEndpoint {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  authenticationRequired: boolean;
  queryParams?: APIQueryParam[];
  requestBody?: string;
  successResponse: string;
}

export interface APISpecification {
  baseUrl: string;
  endpoints: APIEndpoint[];
}

export interface RoadmapPhase {
  phaseNumber: number;
  phaseTitle: string;
  durationWeeks: string;
  milestone: string;
  coreObjectives: string[];
  detailedTasks: string[];
  readinessCriteria: string[];
}

export interface StarterFile {
  filePath: string;
  language: string;
  codeDescription: string;
  codeContent: string;
}

export interface StarterCodeConfig {
  starterFiles: StarterFile[];
}

export interface ProjectState {
  id: string;
  idea: string;
  techKeywords: string;
  extraDetails: string;
  createdAt: string;
  themePreference?: "Industrial" | "Minimalist" | "Playful";
  overview?: ProjectOverview;
  prd?: string;
  userStories?: SprintPlan[];
  databaseSchema?: DatabaseSchema;
  uiWireframe?: UIWireframeConfig;
  apiStructure?: APISpecification;
  roadmap?: RoadmapPhase[];
  starterCode?: StarterCodeConfig;
}
