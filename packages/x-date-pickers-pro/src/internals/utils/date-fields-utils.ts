import { FieldRangeSection } from '@mui/x-date-pickers/internals';

export const splitDateRangeSections = (sections: FieldRangeSection[]) => {
  const startDateSections: FieldRangeSection[] = [];
  const endDateSections: FieldRangeSection[] = [];
  sections.forEach((section) => {
    if (section.dateName === 'start') {
      startDateSections.push(section);
    } else {
      endDateSections.push(section);
    }
  });

  return { startDate: startDateSections, endDate: endDateSections };
};

export const removeLastSeparator = (dateSections: FieldRangeSection[]) =>
  dateSections.map((section, sectionIndex) => {
    if (sectionIndex === dateSections.length - 1) {
      return { ...section, separator: null };
    }

    return section;
  });

export function getRangeFieldType(
  field: React.ElementType & { fieldType?: 'single-input' | 'multi-input' },
) {
  const fieldType = field.fieldType ?? 'multi-input';
  return fieldType;
}
