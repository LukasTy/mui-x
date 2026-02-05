'use client';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useSchedulerStoreContext } from '@mui/x-scheduler-headless/use-scheduler-store-context';
import { useAdapter } from '@mui/x-scheduler-headless/use-adapter';
import { schedulerResourceSelectors } from '@mui/x-scheduler-headless/scheduler-selectors';
import { useStore } from '@base-ui/utils/store';
import {
  useNaturalLanguageEventCreation,
  isGeminiNanoAvailable,
} from '@mui/x-scheduler-headless/natural-language-event-creation';
import type { NaturalLanguageInputProps } from './NaturalLanguageInput.types';

const NaturalLanguageInputRoot = styled('div', {
  name: 'MuiNaturalLanguageInput',
  slot: 'Root',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
}));

const StyledTextField = styled(TextField, {
  name: 'MuiNaturalLanguageInput',
  slot: 'TextField',
})({
  flexGrow: 1,
});

/**
 * A text input component that allows users to create events using natural language.
 * Uses Gemini Nano (Chrome's built-in AI) to parse event descriptions.
 *
 * @example
 * ```tsx
 * <NaturalLanguageInput
 *   placeholder="e.g., Meeting with John tomorrow at 2pm"
 *   onEventCreated={(eventId) => console.log('Created event:', eventId)}
 * />
 * ```
 */
export const NaturalLanguageInput = React.forwardRef(function NaturalLanguageInput(
  props: NaturalLanguageInputProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    placeholder = 'Describe your event...',
    onEventCreated,
    onParseError,
    disabled,
    autoCreateEvent = true,
    ...other
  } = props;

  const store = useSchedulerStoreContext();
  const adapter = useAdapter();
  const resources = useStore(store, schedulerResourceSelectors.processedResourceFlatList);

  const [inputValue, setInputValue] = React.useState('');
  const [isAIAvailable, setIsAIAvailable] = React.useState<boolean | null>(null);

  // Check AI availability on mount
  React.useEffect(() => {
    isGeminiNanoAvailable().then(setIsAIAvailable);
  }, []);

  const availableResources = React.useMemo(
    () =>
      resources.map((r) => ({
        id: r.id,
        title: r.title,
      })),
    [resources],
  );

  const { parseText, isLoading, error } = useNaturalLanguageEventCreation({
    adapter,
    timezone: store.state.displayTimezone,
    availableResources,
    onEventParsed: (event) => {
      if (autoCreateEvent) {
        const eventId = store.createEvent(event);
        onEventCreated?.(eventId);
        setInputValue('');
      }
    },
    onError: onParseError,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) {
      return;
    }

    const result = await parseText(inputValue);
    if (result.success && !autoCreateEvent && result.event) {
      // If autoCreateEvent is false, the consumer handles event creation
      const eventId = store.createEvent(result.event);
      onEventCreated?.(eventId);
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = disabled || isAIAvailable === false;
  const showAIIcon = isAIAvailable !== false;

  return (
    <NaturalLanguageInputRoot ref={ref} {...other}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexGrow: 1, alignItems: 'center' }}>
        <StyledTextField
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isAIAvailable === false ? 'AI not available' : placeholder}
          disabled={isDisabled}
          error={!!error}
          helperText={error}
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: showAIIcon ? (
                <InputAdornment position="start">
                  <Tooltip title="Powered by Gemini Nano">
                    <AutoAwesomeIcon color="primary" fontSize="small" />
                  </Tooltip>
                </InputAdornment>
              ) : undefined,
              endAdornment: (
                <InputAdornment position="end">
                  {isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <IconButton
                      type="submit"
                      disabled={isDisabled || !inputValue.trim()}
                      edge="end"
                      aria-label="Create event"
                    >
                      <SendIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            },
          }}
        />
      </form>
    </NaturalLanguageInputRoot>
  );
});
