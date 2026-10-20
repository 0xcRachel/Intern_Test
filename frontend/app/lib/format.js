export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function formatPrice(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number);
}

export function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

export function normalizeSavedAnswers(savedAnswers) {
  if (!savedAnswers) return {};
  if (Array.isArray(savedAnswers)) {
    return savedAnswers.reduce((result, item) => {
      const questionId = item?.question_id ?? item?.questionId;
      const optionId = item?.option_id ?? item?.optionId ?? item?.selected_option_id;
      if (questionId != null && optionId != null) {
        result[String(questionId)] = Number(optionId);
      }
      return result;
    }, {});
  }
  if (typeof savedAnswers === "object") {
    return Object.entries(savedAnswers).reduce((result, [key, value]) => {
      if (value != null) result[String(key)] = Number(value);
      return result;
    }, {});
  }
  return {};
}

export function answersToPayload(answers) {
  return Object.entries(answers)
    .filter(([, value]) => value != null)
    .map(([questionId, optionId]) => ({
      question_id: Number(questionId),
      option_id: Number(optionId),
    }));
}
