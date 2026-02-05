import { describe, it, expect, vi } from 'vitest';
import { parseNaturalLanguageEvent } from './naturalLanguageEventCreation';
import type { LanguageModelSession } from './naturalLanguageEventCreation.types';
import type { Adapter } from '../use-adapter/useAdapter.types';

// Mock adapter for testing
const createMockAdapter = (): Adapter =>
  ({
    parse: vi.fn((value: string, _format: string, _timezone: string) => {
      // Simple mock that returns a date object with the parsed values
      const date = new Date(value.replace(' ', 'T'));
      return {
        toISOString: () => date.toISOString(),
        getTime: () => date.getTime(),
      };
    }),
    startOfDay: vi.fn((value) => value),
    endOfDay: vi.fn((value) => value),
    addMinutes: vi.fn((value, minutes) => {
      const date = new Date(value.toISOString());
      date.setMinutes(date.getMinutes() + minutes);
      return {
        toISOString: () => date.toISOString(),
        getTime: () => date.getTime(),
      };
    }),
  }) as unknown as Adapter;

// Mock Language Model session
const createMockSession = (responseJson: object): LanguageModelSession => ({
  prompt: vi.fn().mockResolvedValue(JSON.stringify(responseJson)),
  destroy: vi.fn(),
});

describe('naturalLanguageEventCreation', () => {
  describe('parseNaturalLanguageEvent', () => {
    it('should return error for empty text', async () => {
      const adapter = createMockAdapter();
      const session = createMockSession({});

      const result = await parseNaturalLanguageEvent('', session, { adapter });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Please provide an event description.');
    });

    it('should parse a simple event', async () => {
      const adapter = createMockAdapter();
      const session = createMockSession({
        title: 'Meeting with John',
        startDate: '2025-01-15',
        startTime: '14:00',
      });

      const result = await parseNaturalLanguageEvent('Meeting with John tomorrow at 2pm', session, {
        adapter,
        timezone: 'default',
      });

      expect(result.success).toBe(true);
      expect(result.event).toBeDefined();
      expect(result.event?.title).toBe('Meeting with John');
    });

    it('should parse an all-day event', async () => {
      const adapter = createMockAdapter();
      const session = createMockSession({
        title: 'Team offsite',
        startDate: '2025-01-20',
        allDay: true,
      });

      const result = await parseNaturalLanguageEvent('Team offsite on January 20', session, {
        adapter,
        timezone: 'default',
      });

      expect(result.success).toBe(true);
      expect(result.event?.allDay).toBe(true);
    });

    it('should match resource by name', async () => {
      const adapter = createMockAdapter();
      const session = createMockSession({
        title: 'Project meeting',
        startDate: '2025-01-15',
        startTime: '10:00',
        resourceName: 'Conference Room A',
      });

      const result = await parseNaturalLanguageEvent(
        'Project meeting at Conference Room A',
        session,
        {
          adapter,
          timezone: 'default',
          availableResources: [
            { id: 'room-a', title: 'Conference Room A' },
            { id: 'room-b', title: 'Conference Room B' },
          ],
        },
      );

      expect(result.success).toBe(true);
      expect(result.event?.resource).toBe('room-a');
    });

    it('should return error for invalid JSON response', async () => {
      const adapter = createMockAdapter();
      const session: LanguageModelSession = {
        prompt: vi.fn().mockResolvedValue('This is not valid JSON'),
        destroy: vi.fn(),
      };

      const result = await parseNaturalLanguageEvent('Invalid input', session, { adapter });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not parse');
    });

    it('should return error for missing required fields', async () => {
      const adapter = createMockAdapter();
      const session = createMockSession({
        description: 'Some description without title or date',
      });

      const result = await parseNaturalLanguageEvent('Incomplete event', session, { adapter });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Could not determine');
    });

    it('should handle events with description', async () => {
      const adapter = createMockAdapter();
      const session = createMockSession({
        title: 'Team standup',
        description: 'Daily sync meeting',
        startDate: '2025-01-15',
        startTime: '09:00',
        endTime: '09:30',
      });

      const result = await parseNaturalLanguageEvent(
        'Team standup daily sync meeting at 9am for 30 minutes',
        session,
        { adapter, timezone: 'default' },
      );

      expect(result.success).toBe(true);
      expect(result.event?.title).toBe('Team standup');
      expect(result.event?.description).toBe('Daily sync meeting');
    });

    it('should use default duration when no end time specified', async () => {
      const adapter = createMockAdapter();
      const session = createMockSession({
        title: 'Quick call',
        startDate: '2025-01-15',
        startTime: '14:00',
      });

      const result = await parseNaturalLanguageEvent('Quick call at 2pm', session, {
        adapter,
        timezone: 'default',
        defaultDurationMinutes: 30,
      });

      expect(result.success).toBe(true);
      expect(adapter.addMinutes).toHaveBeenCalledWith(expect.anything(), 30);
    });
  });
});
