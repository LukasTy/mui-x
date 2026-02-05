import type { SchedulerEventCreationProperties, SchedulerResourceId } from '../models';
import type { Adapter } from '../use-adapter/useAdapter.types';
import type { TemporalSupportedObject } from '../base-ui-copy/types';
import type {
  NaturalLanguageEventCreationConfig,
  NaturalLanguageEventParseResult,
  ParsedEventData,
  LanguageModelSession,
} from './naturalLanguageEventCreation.types';

/**
 * Creates the system prompt for the language model to parse natural language event descriptions.
 */
function createSystemPromptContent(
  referenceDate: Date,
  availableResources?: Array<{ id: SchedulerResourceId; title: string }>,
): string {
  const formattedDate = referenceDate.toISOString().split('T')[0];
  const dayOfWeek = referenceDate.toLocaleDateString('en-US', { weekday: 'long' });

  let resourceInfo = '';
  if (availableResources && availableResources.length > 0) {
    const resourceList = availableResources.map((r) => `"${r.title}"`).join(', ');
    resourceInfo = `\nAvailable resources: ${resourceList}. If the user mentions a resource, include it as "resourceName" in the response.`;
  }

  return `You are a helpful assistant that parses natural language event descriptions into structured JSON data for a calendar application.

Today's date is ${formattedDate} (${dayOfWeek}).

When the user describes an event, extract the following information and respond ONLY with a valid JSON object (no additional text):

{
  "title": "Event title (required)",
  "description": "Event description (optional)",
  "startDate": "YYYY-MM-DD format (required)",
  "startTime": "HH:mm format in 24h (optional, omit for all-day events)",
  "endDate": "YYYY-MM-DD format (optional, defaults to startDate)",
  "endTime": "HH:mm format in 24h (optional)",
  "allDay": true/false (optional, default false),
  "resourceName": "Name of the resource (optional)"
}
${resourceInfo}
Rules:
1. Interpret relative dates like "tomorrow", "next Monday", "in 2 days" relative to today (${formattedDate}).
2. For times like "3pm", "15:00", "afternoon" - convert to 24h format (HH:mm).
3. "Morning" = 09:00, "Afternoon" = 14:00, "Evening" = 18:00, "Night" = 20:00.
4. If no end time is specified, leave endTime empty.
5. If the event spans multiple days, set different startDate and endDate.
6. For "all day" events or events without specific times, set allDay to true and omit times.
7. Always respond with ONLY the JSON object, no explanations or markdown.`;
}

/**
 * Creates the user prompt with the natural language event description.
 */
function createUserPrompt(text: string): string {
  return `Parse this event description: "${text}"`;
}

/**
 * Parses the JSON response from the language model.
 */
function parseResponse(response: string): ParsedEventData | null {
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }
    return JSON.parse(jsonMatch[0]) as ParsedEventData;
  } catch {
    return null;
  }
}

/**
 * Parses a date string in YYYY-MM-DD format and optional time in HH:mm format
 * using the adapter's parse method.
 */
function parseDateTimeWithAdapter(
  adapter: Adapter,
  dateStr: string,
  timeStr: string | undefined,
  timezone: string,
): TemporalSupportedObject {
  if (timeStr) {
    // Parse date with time
    const dateTimeStr = `${dateStr} ${timeStr}`;
    return adapter.parse(dateTimeStr, 'yyyy-MM-dd HH:mm', timezone);
  }
  // Parse date only
  return adapter.parse(dateStr, 'yyyy-MM-dd', timezone);
}

/**
 * Converts parsed event data to scheduler event creation properties.
 */
function convertToEventProperties(
  parsed: ParsedEventData,
  config: NaturalLanguageEventCreationConfig,
): SchedulerEventCreationProperties {
  const { adapter, timezone = 'default', availableResources, defaultDurationMinutes = 60 } = config;

  let start: TemporalSupportedObject;
  let end: TemporalSupportedObject;

  if (parsed.allDay || !parsed.startTime) {
    // All-day event
    const startDate = parseDateTimeWithAdapter(adapter, parsed.startDate, undefined, timezone);
    start = adapter.startOfDay(startDate);
    const endDateStr = parsed.endDate || parsed.startDate;
    const endDate = parseDateTimeWithAdapter(adapter, endDateStr, undefined, timezone);
    end = adapter.endOfDay(endDate);
  } else {
    // Timed event
    start = parseDateTimeWithAdapter(adapter, parsed.startDate, parsed.startTime, timezone);

    if (parsed.endTime) {
      const endDateStr = parsed.endDate || parsed.startDate;
      end = parseDateTimeWithAdapter(adapter, endDateStr, parsed.endTime, timezone);
    } else {
      // Default duration
      end = adapter.addMinutes(start, defaultDurationMinutes);
    }
  }

  const event: SchedulerEventCreationProperties = {
    title: parsed.title,
    start,
    end,
    allDay: parsed.allDay || !parsed.startTime,
    timezone,
  };

  if (parsed.description) {
    event.description = parsed.description;
  }

  // Match resource by name
  if (parsed.resourceName && availableResources) {
    const matchedResource = availableResources.find(
      (r) => r.title.toLowerCase() === parsed.resourceName!.toLowerCase(),
    );
    if (matchedResource) {
      event.resource = matchedResource.id;
    }
  }

  return event;
}

/**
 * Checks if the built-in AI Language Model is available in the browser.
 * Uses the Chrome built-in AI Prompt API.
 * @see https://developer.chrome.com/docs/ai/prompt-api
 */
export async function isLanguageModelAvailable(): Promise<boolean> {
  if (typeof globalThis.LanguageModel === 'undefined') {
    return false;
  }

  try {
    const availability = await globalThis.LanguageModel.availability({
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
    });
    return availability !== 'unavailable';
  } catch {
    return false;
  }
}

/**
 * @deprecated Use `isLanguageModelAvailable` instead.
 */
export const isGeminiNanoAvailable = isLanguageModelAvailable;

/**
 * Creates a language model session for parsing natural language event descriptions.
 * Uses the Chrome built-in AI Prompt API.
 * @see https://developer.chrome.com/docs/ai/prompt-api
 */
export async function createLanguageModelSession(
  config: NaturalLanguageEventCreationConfig,
): Promise<LanguageModelSession | null> {
  if (typeof globalThis.LanguageModel === 'undefined') {
    return null;
  }

  const referenceDate = config.referenceDate || new Date();
  const systemPromptContent = createSystemPromptContent(referenceDate, config.availableResources);

  try {
    return await globalThis.LanguageModel.create({
      initialPrompts: [{ role: 'system', content: systemPromptContent }],
      expectedInputs: [{ type: 'text', languages: ['en'] }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }],
    });
  } catch {
    return null;
  }
}

/**
 * @deprecated Use `createLanguageModelSession` instead.
 */
export const createGeminiNanoSession = createLanguageModelSession;

/**
 * Parses natural language text into event creation properties using the built-in AI.
 */
export async function parseNaturalLanguageEvent(
  text: string,
  session: LanguageModelSession,
  config: NaturalLanguageEventCreationConfig,
): Promise<NaturalLanguageEventParseResult> {
  if (!text.trim()) {
    return {
      success: false,
      error: 'Please provide an event description.',
    };
  }

  try {
    const userPrompt = createUserPrompt(text);
    const response = await session.prompt(userPrompt);

    const parsed = parseResponse(response);
    if (!parsed) {
      return {
        success: false,
        error: 'Could not parse the event description. Please try rephrasing.',
        rawResponse: response,
      };
    }

    if (!parsed.title || !parsed.startDate) {
      return {
        success: false,
        error: 'Could not determine the event title or date. Please be more specific.',
        rawResponse: response,
      };
    }

    const event = convertToEventProperties(parsed, config);

    return {
      success: true,
      event,
      rawResponse: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred.',
    };
  }
}

/**
 * One-shot function to parse natural language and create an event.
 * Creates a session, parses the text, and destroys the session.
 */
export async function parseNaturalLanguageEventOneShot(
  text: string,
  config: NaturalLanguageEventCreationConfig,
): Promise<NaturalLanguageEventParseResult> {
  const session = await createLanguageModelSession(config);

  if (!session) {
    return {
      success: false,
      error: 'Built-in AI is not available. Please use Chrome with AI features enabled.',
    };
  }

  try {
    return await parseNaturalLanguageEvent(text, session, config);
  } finally {
    session.destroy();
  }
}
