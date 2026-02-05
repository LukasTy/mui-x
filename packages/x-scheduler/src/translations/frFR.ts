import { SchedulerTranslations } from '../models/translations';

export const frFR: Partial<SchedulerTranslations> = {
  // ViewSwitcher
  agenda: 'Agenda',
  day: 'Jour',
  month: 'Mois',
  other: 'Autre',
  today: "Aujourd'hui",
  week: 'Semaine',

  // WeekView
  allDay: 'Toute la journée',

  // NaturalLanguageInput
  naturalLanguageInputPlaceholder: 'Décrivez votre événement...',
  naturalLanguageInputAINotAvailable: 'IA non disponible',
  naturalLanguageInputPoweredBy: 'Propulsé par Gemini Nano',
  naturalLanguageInputCreateEvent: 'Créer un événement',

  // AIEventCreation
  aiEventCreationTooltip: "Créer un événement avec l'IA",
  aiEventCreationTitle: "Créer un événement avec l'IA",
  aiEventCreationInputLabel: "Description de l'événement",
  aiEventCreationPlaceholder: 'ex: Réunion avec Jean demain à 14h pendant 1 heure',
  aiEventCreationHelperText:
    "Décrivez votre événement en langage naturel et l'IA le créera pour vous.",
  aiEventCreationSubmit: "Créer l'événement",
  aiEventCreationProcessing: 'Création en cours...',
};
