export function formatDateOnly(dateString?: string | null) {
    if (!dateString) return "—";
  
    const [year, month, day] = dateString.slice(0, 10).split("-");
    if (!year || !month || !day) return dateString;
  
    return `${month}/${day}/${year.slice(-2)}`;
  }