'use client';
import * as React from 'react';
import type { Adapter } from '../use-adapter/useAdapter.types';
import type { SchedulerEventCreationProperties, SchedulerResourceId } from '../models';
import type {
  NaturalLanguageEventCreationConfig,
  NaturalLanguageEventParseResult,
  LanguageModelSession,
} from './naturalLanguageEventCreation.types';
import {
  createLanguageModelSession,
  parseNaturalLanguageEvent,
  isLanguageModelAvailable,
} from './naturalLanguageEventCreation';

export interface UseNaturalLanguageEventCreationParams {
  /**
   * The adapter to use for date/time operations.
   */
  adapter: Adapter;
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
  /**
   * Callback fired when an event is successfully parsed.
   */
  onEventParsed?: (event: SchedulerEventCreationProperties) => void;
  /**
   * Callback fired when parsing fails.
   */
  onError?: (error: string) => void;
}

export interface UseNaturalLanguageEventCreationResult {
  /**
   * Whether the built-in AI Language Model is available and ready to use.
   */
  isAvailable: boolean;
  /**
   * Whether the AI model is currently processing.
   */
  isLoading: boolean;
  /**
   * The current error message, if any.
   */
  error: string | null;
  /**
   * The last successfully parsed event.
   */
  parsedEvent: SchedulerEventCreationProperties | null;
  /**
   * Parses natural language text and returns event creation properties.
   */
  parseText: (text: string) => Promise<NaturalLanguageEventParseResult>;
  /**
   * Clears the current error and parsed event.
   */
  reset: () => void;
}

/**
 * Hook for creating events from natural language text using Chrome's built-in AI.
 *
 * This hook manages the Language Model session lifecycle and provides a simple
 * interface for parsing natural language event descriptions.
 *
 * @see https://developer.chrome.com/docs/ai/prompt-api
 *
 * @example
 * ```tsx
 * const { parseText, isLoading, parsedEvent, error } = useNaturalLanguageEventCreation({
 *   adapter,
 *   timezone: 'America/New_York',
 *   onEventParsed: (event) => {
 *     store.createEvent(event);
 *   },
 * });
 *
 * // In a form submit handler:
 * const result = await parseText("Meeting with John tomorrow at 2pm");
 * if (result.success) {
 *   // Event was created
 * }
 * ```
 */
export function useNaturalLanguageEventCreation(
  params: UseNaturalLanguageEventCreationParams,
): UseNaturalLanguageEventCreationResult {
  const {
    adapter,
    timezone = 'default',
    availableResources,
    defaultDurationMinutes = 60,
    onEventParsed,
    onError,
  } = params;

  const [isAvailable, setIsAvailable] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [parsedEvent, setParsedEvent] = React.useState<SchedulerEventCreationProperties | null>(
    null,
  );

  const sessionRef = React.useRef<LanguageModelSession | null>(null);
  const configRef = React.useRef<NaturalLanguageEventCreationConfig>({
    adapter,
    timezone,
    availableResources,
    defaultDurationMinutes,
  });

  // Update config ref when params change
  React.useEffect(() => {
    configRef.current = {
      adapter,
      timezone,
      availableResources,
      defaultDurationMinutes,
      referenceDate: new Date(),
    };
  }, [adapter, timezone, availableResources, defaultDurationMinutes]);

  // Check availability on mount
  React.useEffect(() => {
    let mounted = true;

    isLanguageModelAvailable().then((available) => {
      if (mounted) {
        setIsAvailable(available);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Initialize session when available
  React.useEffect(() => {
    let mounted = true;

    if (isAvailable && !sessionRef.current) {
      createLanguageModelSession(configRef.current).then((session) => {
        if (mounted && session) {
          sessionRef.current = session;
        }
      });
    }

    return () => {
      mounted = false;
      if (sessionRef.current) {
        sessionRef.current.destroy();
        sessionRef.current = null;
      }
    };
  }, [isAvailable]);

  const parseText = React.useCallback(
    async (text: string): Promise<NaturalLanguageEventParseResult> => {
      if (!isAvailable) {
        const errorMsg =
          'Built-in AI is not available. Please use Chrome with AI features enabled.';
        setError(errorMsg);
        onError?.(errorMsg);
        return { success: false, error: errorMsg };
      }

      setIsLoading(true);
      setError(null);

      try {
        // Ensure we have a session
        if (!sessionRef.current) {
          // Update reference date for fresh parsing
          configRef.current.referenceDate = new Date();
          sessionRef.current = await createLanguageModelSession(configRef.current);

          if (!sessionRef.current) {
            const errorMsg = 'Failed to create AI session.';
            setError(errorMsg);
            onError?.(errorMsg);
            return { success: false, error: errorMsg };
          }
        }

        const result = await parseNaturalLanguageEvent(text, sessionRef.current, configRef.current);

        if (result.success && result.event) {
          setParsedEvent(result.event);
          onEventParsed?.(result.event);
        } else if (result.error) {
          setError(result.error);
          onError?.(result.error);
        }

        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMsg);
        onError?.(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    [isAvailable, onEventParsed, onError],
  );

  const reset = React.useCallback(() => {
    setError(null);
    setParsedEvent(null);
  }, []);

  return {
    isAvailable,
    isLoading,
    error,
    parsedEvent,
    parseText,
    reset,
  };
}
