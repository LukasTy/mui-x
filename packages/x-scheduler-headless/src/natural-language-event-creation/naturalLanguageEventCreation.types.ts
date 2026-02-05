import type { SchedulerEventCreationProperties, SchedulerResourceId } from '../models';
import type { Adapter } from '../use-adapter/useAdapter.types';

/**
 * The result of parsing natural language text into event properties.
 */
export interface NaturalLanguageEventParseResult {
  /**
   * Whether the parsing was successful.
   */
  success: boolean;
  /**
   * The parsed event properties if successful.
   */
  event?: SchedulerEventCreationProperties;
  /**
   * Error message if parsing failed.
   */
  error?: string;
  /**
   * The raw response from the AI model.
   */
  rawResponse?: string;
}

/**
 * Configuration for the natural language event creation.
 */
export interface NaturalLanguageEventCreationConfig {
  /**
   * The adapter to use for date/time operations.
   */
  adapter: Adapter;
  /**
   * The current date/time to use as reference for relative date parsing.
   * If not provided, the current date/time will be used.
   */
  referenceDate?: Date;
  /**
   * The timezone to use for the created events.
   * @default 'default'
   */
  timezone?: string;
  /**
   * Available resources that can be assigned to events.
   */
  availableResources?: Array<{
    id: SchedulerResourceId;
    title: string;
  }>;
  /**
   * Default duration in minutes for events when no duration is specified.
   * @default 60
   */
  defaultDurationMinutes?: number;
}

/**
 * The parsed event data extracted from natural language.
 */
export interface ParsedEventData {
  /**
   * The title of the event.
   */
  title: string;
  /**
   * The description of the event.
   */
  description?: string;
  /**
   * The start date in ISO format (YYYY-MM-DD).
   */
  startDate: string;
  /**
   * The start time in 24h format (HH:mm).
   */
  startTime?: string;
  /**
   * The end date in ISO format (YYYY-MM-DD).
   */
  endDate?: string;
  /**
   * The end time in 24h format (HH:mm).
   */
  endTime?: string;
  /**
   * Whether this is an all-day event.
   */
  allDay?: boolean;
  /**
   * The name of the resource to assign (will be matched against available resources).
   */
  resourceName?: string;
}

/**
 * Initial prompt for the language model session.
 * Based on the Chrome built-in AI Prompt API.
 */
export interface LanguageModelInitialPrompt {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Language model session interface.
 * Based on the Chrome built-in AI Prompt API.
 */
export interface LanguageModelSession {
  /**
   * Prompts the model with the given text and returns the response.
   */
  prompt: (text: string) => Promise<string>;
  /**
   * Destroys the session and frees up resources.
   */
  destroy: () => void;
}

/**
 * Availability status for the language model.
 */
export type LanguageModelAvailability =
  | 'available'
  | 'downloadable'
  | 'downloading'
  | 'unavailable';

/**
 * Options for creating a language model session.
 */
export interface LanguageModelCreateOptions {
  initialPrompts?: LanguageModelInitialPrompt[];
  expectedInputs?: Array<{ type: string; languages?: string[] }>;
  expectedOutputs?: Array<{ type: string; languages?: string[] }>;
  monitor?: (monitor: {
    addEventListener: (event: string, handler: (e: { loaded: number }) => void) => void;
  }) => void;
}

/**
 * The global LanguageModel interface exposed by Chrome for built-in AI.
 * Based on the Chrome built-in AI Prompt API.
 * @see https://developer.chrome.com/docs/ai/prompt-api
 */
export interface LanguageModelAPI {
  availability: (options?: {
    expectedInputs?: Array<{ type: string; languages?: string[] }>;
    expectedOutputs?: Array<{ type: string; languages?: string[] }>;
  }) => Promise<LanguageModelAvailability>;
  create: (options?: LanguageModelCreateOptions) => Promise<LanguageModelSession>;
  params: () => Promise<{
    defaultTemperature: number;
    maxTemperature: number;
    defaultTopK: number;
    maxTopK: number;
  }>;
}

declare global {
  // eslint-disable-next-line no-var
  var LanguageModel: LanguageModelAPI | undefined;
}
