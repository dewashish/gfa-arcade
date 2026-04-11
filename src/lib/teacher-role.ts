// Maps the `role` slug stored on the teachers row (set during the signup
// wizard) to a friendly label shown in the sidebar + header profile badge.
// Kept tiny so both client and server components can import it.

export function formatTeacherRole(role?: string | null): string {
  switch ((role ?? "").toLowerCase()) {
    case "class_teacher":
      return "Class Teacher";
    case "assistant_teacher":
      return "Assistant Teacher";
    case "teaching_assistant":
      return "Teaching Assistant";
    case "specialist":
      return "Specialist";
    case "head_of_year":
      return "Head of Year";
    case "other":
      return "Teacher";
    default:
      return "Year 1 Teacher";
  }
}
