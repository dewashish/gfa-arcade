/**
 * Stitch-extracted illustration assets for the Activity Bank.
 *
 * These URLs come from the "Subject Illustration Pack" Stitch screen
 * (id: 6960583570bf42cd9b9f116db794bf9f). The illustrations are
 * AI-generated, kid-friendly, and on-brand with the Founders Arcade
 * design system.
 *
 * Per ui-ux-pro-max `image-dimension` rule, every entry includes
 * width/height so Next.js Image can reserve space and avoid CLS.
 *
 * To regenerate: re-run `mcp__stitch__generate_screen_from_text` for
 * the Subject Pack and update the URLs below.
 */

export type SubjectKey =
  | "maths"
  | "phonics"
  | "science"
  | "geography"
  | "history"
  | "pshe";

export interface BankImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export const SUBJECT_IMAGES: Record<SubjectKey, BankImage> = {
  maths: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAiQHYR9hlxTPqe3h4SGkj-iQ68za7djh0bk3SbUU4Txv4N2NyjvVg9noLdF7MIwuUAT2X_9qpyjgxo0cwgWWd4LyJf2xBhVrCVlSBOs4r1jjg5kbXqQNsNp6V-vk4ZNcRcpohFy8QCa7xhCgb8yMDkKmiFuzVVFUKwkRLZ7xJUk5G8ZpNExPPYIeWSU0s54koWNDvj1JbXAacmeyvQBad1CTW0MJfO0W4kzrmszepoFDehtglXc6owz-ovdohzSxqi8gGgfjlpaQA",
    alt: "Vibrant hand-drawn illustration of colorful counting blocks and a playful calculator with a smiling face",
    width: 400,
    height: 400,
  },
  phonics: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7J9L6HsMiQDDZVxZfTsk5rY9by1vqUVOoigmAauL7POIwAkxBc3t7-xOi8ea3hklF5FDvxVWpr5MxfvvUYGpEMmH_qXI77F3F3IqrV9pzPMnY3O0FFgB3yspOJMtB_0_vocCvg6PY5hLUUx4e2w5sOG5aj_y17ncxBWMSmt8Ul3g1lxlBgtUY2d3Z2P8YVwWBzPeKkM3qZx8snU95Vpz5VRHbQroGgxrlyBLgfqdsZMC-M_HnqzKkDR6YwtF3b8dXMTp_GbttQR8",
    alt: "Hand-drawn open book with magical letters A, B, and C floating out like sparkles",
    width: 400,
    height: 400,
  },
  science: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1kyulnE2_ddmKUhdK1N92_qbUirFlHXbONTwTZIEOjNchg3Xw7fYv3AMx_OyILqWQXAt-X3-A6hoHRwPRG-A104mVQ-15RdT6SohcGZYHgfWNoN-WVMozQlmrwdySRgsA8Bz956sCrqyNyCfD_NbGHEg8vxL292Pbke4FfE2stVo-B6g_75kIAb-RUZSBbykiCStbmhexzZnr8mvW2cAS8ALTMjs0uP1qcxULDaGVLPqo_wRUVHM0QP7z0cR9v_Yf5cAWjWJ7B5Y",
    alt: "Playful cartoon drawing of a green sprout in a pot, a yellow sun with a face, and a colorful microscope",
    width: 400,
    height: 400,
  },
  geography: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-EfrrwOmgMG4hEwt9IaDd4uJHEtskr1_YXkvQF-ycGgbAUxqUwYrF2wOn88GoWna2swh5uVqbKOoOtrUuaPsW4FMcs15Gy_8lQQlkWO6lYvy-J-dIsp8EPno6gOOuVc21BzrD6dZvLCDmXKDtcjBB0zs_4kBnD2aI-6rNW7GgYp5Idur5_DCQwxGxLNIxuStYO2crEGNAfNWoGResUJN4WxNOASe7w_kLOrofAKb2ecHL4CDuRAHVoarOOSgHiQlWsUYZJmcp_rc",
    alt: "Kid-friendly illustration of a blue and green earth globe with a small red airplane flying around it",
    width: 400,
    height: 400,
  },
  history: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAyA7pfLwaxTfqmtwbNIwNrcKZgqtZeuquaqhjx1P6KZpR4zQxycFAQO16SzyCMJFTbf1wi4Lm5_seW-APAWlB4dO3-jqaRZJQfi7t8M_fhZ4j8clbtwhyzumZqoesvpcn53D7uXYQj89tUzIlahQQ7uTEs0wnTOKQS2nyn3t-zL3mvS5dtMP5bHi9Wv_0tY3pPySQtul_qqy3BPiEMYICEFBjAil0jpWR2_y0_rrYnrKTUGnlo4k5Pekqqkw19hoolJ7mQCI64ANE",
    alt: "Vibrant cartoon castle with purple towers, a golden crown, and an old-fashioned scroll",
    width: 400,
    height: 400,
  },
  pshe: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAahc2K9lh2sudc0ujMQBVkZgRhVeEVoEf1dQAMuU4gRUM3w1vKhOE28B5stLmxvZ4zIi28ilcdS5p38HQJJ7Q7_6n92UfzxS9gYT0V-RDaKX0SBaWfTvi3kvaT_8J372lpURD4kenfc1ntxiN29ti6MGQOVuQityEpUjfxundp-JN1-aCsy5Wg59BqHCr4ePZLjt6NdpNTreRHw4zKTsBlh6xiUM1rctH-Cbn5ydppcAZne3iJxete9q044PW4rI0Ad5y_KmXD_NA",
    alt: "Two cartoon hands holding each other in front of a giant red heart and a cheerful rainbow",
    width: 400,
    height: 400,
  },
};

/**
 * Subject metadata: display name, gradient pair, and content tag.
 * Gradient colors come from the Subject Pack screen design.
 */
export const SUBJECT_META: Record<
  SubjectKey,
  { label: string; emoji: string; gradient: [string, string]; tone: string }
> = {
  maths: {
    label: "Maths",
    emoji: "🔢",
    gradient: ["#00629e", "#2e97e6"],
    tone: "Numeracy",
  },
  phonics: {
    label: "Phonics",
    emoji: "🔤",
    gradient: ["#7c5800", "#feb700"],
    tone: "Literacy",
  },
  science: {
    label: "Science",
    emoji: "🌱",
    gradient: ["#006a61", "#00a396"],
    tone: "Discovery",
  },
  geography: {
    label: "Geography",
    emoji: "🌍",
    gradient: ["#FF6D00", "#FF8A80"],
    tone: "Around the World",
  },
  history: {
    label: "History",
    emoji: "👑",
    gradient: ["#6200EA", "#E040FB"],
    tone: "Long Ago",
  },
  pshe: {
    label: "PSHE",
    emoji: "💛",
    gradient: ["#D50000", "#FF6F61"],
    tone: "Life Skills",
  },
};

export const SUBJECT_KEYS: SubjectKey[] = [
  "maths",
  "phonics",
  "science",
  "geography",
  "history",
  "pshe",
];
