import {
  addDays,
  format,
  formatISO,
  isValid,
  parse,
  parseISO,
  startOfDay,
} from "date-fns";

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

function parseDateValue(value: string) {
  return dateOnlyPattern.test(value)
    ? parse(value, "yyyy-MM-dd", new Date())
    : parseISO(value);
}

export function isValidDateValue(value: string) {
  return isValid(parseDateValue(value));
}

export function normalizeScheduledFromDate(value?: string) {
  if (!value) {
    return null;
  }

  if (!dateOnlyPattern.test(value)) {
    return value;
  }

  return formatISO(startOfDay(parseDateValue(value)));
}

export function normalizeScheduledToDate(value?: string) {
  if (!value) {
    return null;
  }

  if (!dateOnlyPattern.test(value)) {
    return {
      operator: "lte" as const,
      value,
    };
  }

  return {
    operator: "lt" as const,
    value: formatISO(addDays(startOfDay(parseDateValue(value)), 1)),
  };
}

export function formatDateTime(value: string) {
  return format(parseISO(value), "PPP p");
}

export function formatDateOnly(value: string) {
  return format(parseISO(value), "PPP");
}

export function toDateTimeInputValue(value: string) {
  return format(parseISO(value), "yyyy-MM-dd'T'HH:mm");
}

export function dateTimeInputToIso(value: string) {
  return parse(value, "yyyy-MM-dd'T'HH:mm", new Date()).toISOString();
}

export function nowIso() {
  return formatISO(new Date());
}
