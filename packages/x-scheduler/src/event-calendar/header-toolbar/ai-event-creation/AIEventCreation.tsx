'use client';
import * as React from 'react';
import { styled } from '@mui/material/styles';
import { useStore } from '@base-ui/utils/store';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import { useEventCalendarStoreContext } from '@mui/x-scheduler-headless/use-event-calendar-store-context';
import { useAdapter } from '@mui/x-scheduler-headless/use-adapter';
import { schedulerResourceSelectors } from '@mui/x-scheduler-headless/scheduler-selectors';
import {
  useNaturalLanguageEventCreation,
  isLanguageModelAvailable,
} from '@mui/x-scheduler-headless/natural-language-event-creation';
import clsx from 'clsx';
import { useTranslations } from '../../../internals/utils/TranslationsContext';
import { useEventCalendarClasses } from '../../EventCalendarClassesContext';

const AIEventCreationRoot = styled('div', {
  name: 'MuiEventCalendar',
  slot: 'AIEventCreation',
})({});

export const AIEventCreation = React.forwardRef(function AIEventCreation(
  props: React.HTMLAttributes<HTMLDivElement>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  // Context hooks
  const translations = useTranslations();
  const store = useEventCalendarStoreContext();
  const adapter = useAdapter();
  const classes = useEventCalendarClasses();

  // Selector hooks
  const resources = useStore(store, schedulerResourceSelectors.processedResourceFlatList);

  // State hooks
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [isAIAvailable, setIsAIAvailable] = React.useState<boolean | null>(null);

  // Check AI availability on mount
  React.useEffect(() => {
    isLanguageModelAvailable().then(setIsAIAvailable);
  }, []);

  const availableResources = React.useMemo(
    () =>
      resources.map((r) => ({
        id: r.id,
        title: r.title,
      })),
    [resources],
  );

  const { parseText, isLoading, error, reset } = useNaturalLanguageEventCreation({
    adapter,
    timezone: store.state.displayTimezone,
    availableResources,
    onEventParsed: (event) => {
      store.createEvent(event);
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      handleClose();
    },
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setInputValue('');
    reset();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading) {
      return;
    }
    await parseText(inputValue);
  };

  // Don't render if AI is not available
  if (isAIAvailable === false) {
    return null;
  }

  return (
    <AIEventCreationRoot
      ref={forwardedRef}
      {...props}
      className={clsx(props.className, classes.aiEventCreation)}
    >
      <Tooltip title={translations.aiEventCreationTooltip}>
        <IconButton
          aria-label={translations.aiEventCreationTooltip}
          onClick={handleOpen}
          disabled={isAIAvailable === null}
        >
          <AutoAwesomeIcon />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="ai-event-creation-dialog-title"
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle id="ai-event-creation-dialog-title">
            {translations.aiEventCreationTitle}
          </DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              autoFocus
              margin="dense"
              label={translations.aiEventCreationInputLabel}
              placeholder={translations.aiEventCreationPlaceholder}
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              disabled={isLoading}
              helperText={translations.aiEventCreationHelperText}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={isLoading}>
              {translations.cancel}
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !inputValue.trim()}
              startIcon={isLoading ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
            >
              {isLoading
                ? translations.aiEventCreationProcessing
                : translations.aiEventCreationSubmit}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </AIEventCreationRoot>
  );
});
