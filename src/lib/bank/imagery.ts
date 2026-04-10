/**
 * Stitch-extracted illustration assets for the Activity Bank.
 *
 * Sources:
 *  - Subject Hero Pack (id 6960583570bf42cd9b9f116db794bf9f)
 *  - Maths Topic Pack  (id 857a4f0966f74a7fa96402e84505f43b)
 *  - Literacy Topic Pack (id c26dd1b720474aea997878ab8d8f2d67)
 *  - World & Self Topic Pack (id 7ecddfe3a39740729317fa5395d60eca)
 *  - Empty State Pack (id 3012cc30c31f494898c9b98d9f17810f)
 *
 * Per ui-ux-pro-max `image-dimension` rule, every entry includes width/height.
 */

import type { BankActivity } from "./types";

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

// ===== Subject hero images (fallbacks when no topic-specific image exists) =====
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

// ===== Topic-specific images (more contextual than subject fallback) =====
// Keys correspond to substrings matched against `activity.topic` lowercase.
export const TOPIC_IMAGES: Record<string, BankImage> = {
  // Maths topics
  counting: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBp1Tpzc_M8iDXI6yzWpHnOjzB7MVT46PtQvTH1Bbf03v4S7V05AhwueJd2JsxlbzQp0QN_GcAgTUzcpy-_FpJw7GuEGx_6YP-_wMvp-JFHWoEyBvlswMZ0oU2rh0pVIoXfdtx93TJPK4g8_UikUCQGnryJiBmXpXMfCa6jLwnj0q4h5xsKUlNvMequyDtyKH04dD9I6XJlxscg5XUib-ClJVV1FoMqjWvsPZxRHn4hGeCe3vPBhcwjj6uB5XWULS3u8NJKXWSy8_k",
    alt: "Counting blocks with a friendly hand pointing at them",
    width: 400,
    height: 400,
  },
  addition: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuArk3Tb16FU7pG0wQ7-ExI9wfmPgdVUUmIxVBoQrbnH7-u_B_lvHgjEE5NSIU253nVfqecturZB4ZJ2qgg03-saAP5HE4ULZW327LgZd2Yog5JjsfXz8sA1tWC-yS99e4zBgQyA3VnuGhQGq2wSrMdNu4rPTKnogURxkiohAkj3PEY687yEB3JVeu1ORuGrjc9AdrfngOKFUA3P5A7zs97KzUblxpZXiwH1FKX8I3Ui05TUi1_xog-tvkc9jZOwc04jPalm-8pBHzU",
    alt: "Two apples plus three apples equals five apples with a yellow plus sign",
    width: 400,
    height: 400,
  },
  doubles: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC65KrbIunyPD3Lx16_jiDwBss2pqQYDl2_vuj6JfyCvI8DvL_ApH7FYzkiBmW4qpAXODE8cVspJPHMfFyX5qcxSZ-0oRtMnxsgDQM6e-HKe0J3R6i52Epi_7qIK8JNM_yzdGp3-mwgdeVyzrmozR_i3CZaQKVUJ_dzpWfI3UwqiTDrvF5Nv_7C9H-JqbHP4Oaz7R6dXObB-0OS1dO1nn7qJOqAt_3-yqNNqjYdvK0Z0Ym1cwyS3A7vmeA4qB_uAltuQA_ZoqQ7_iY",
    alt: "Mirrored arrangement of stars showing doubles and halves",
    width: 400,
    height: 400,
  },
  shapes: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCe4EfZHp8lWBbFJ3luJHtCbT-o4hpJ-xToZiIAoH3cnmx0UMjX8MWSFNzxZTjevk7U_QgK56FRXmO98m_5jSdahKiFNoIGdJC5seTzYo9XLER3UjNJDBQY7psFTTiugUBkhq8tXffTIoUkm9EYx2F4x5S6v1PhHWvBZOPVGODcCeh0v-7L8lr0KZnlj77S7pIvzof8StW4icYdVn7wjDGxSEZj2S84oqAiePmU1hOCXNnJQ_2HYwyAq_QBOtH7Pi-jMcQEplCR14",
    alt: "Friendly cartoon shapes — triangle, square, circle, and cube — with smiling faces",
    width: 400,
    height: 400,
  },

  // Phonics topics
  "phase 2": {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6uqChATYXtpHgw97-RqIaEZClzDScJC9pRp0Hr8CypYvGftl2YEGe2d3li3vsuNN2j7pKktn5EukHObk37mCAn4ycSUDsdLGvrWZ6dxFqAG7REAVcvovwyqrbnfVer7iiHOdY5BO0KtvxcLworR8-RgWCP_YoCHypTJcXAXkYd_c_67OgWXLIzX8sWC4g1sekuMWYXZDuy8OmFPPNi-qR-sFb8KLMnJWY0T3Sy2F3JDL_djFArCbwv3lf0uRaklRUNUrht1EvzJM",
    alt: "Vibrant hand-drawn letters S, A, T, P with cute smiling cartoon mouths and colorful sound waves",
    width: 400,
    height: 400,
  },
  "first sound": {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6uqChATYXtpHgw97-RqIaEZClzDScJC9pRp0Hr8CypYvGftl2YEGe2d3li3vsuNN2j7pKktn5EukHObk37mCAn4ycSUDsdLGvrWZ6dxFqAG7REAVcvovwyqrbnfVer7iiHOdY5BO0KtvxcLworR8-RgWCP_YoCHypTJcXAXkYd_c_67OgWXLIzX8sWC4g1sekuMWYXZDuy8OmFPPNi-qR-sFb8KLMnJWY0T3Sy2F3JDL_djFArCbwv3lf0uRaklRUNUrht1EvzJM",
    alt: "Letters with cute mouths showing first phonics sounds",
    width: 400,
    height: 400,
  },
  digraph: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1n7TeQhQHDkJ6YAKFi7DjOarQp4qLUOJ3BcGRL1Qf8kiv3MyQKO35vEskeS_Z34jWHQ7o8zqCxJ5dRAU6PHHq0PsURT2NIvN8aWiPT6jTit8idcKOtVFH8TuXA8VsA6CmRsmNCqAxouDqxlrdL0HUEDP2qGfDOAszStVDtQTfJn0zRCTpKdTx3R0-NjZh2e40ELTl7xiTdNvN96WUSCmxMQzUMPW1drF7hzmI50029M3CX8mQ77aB_lXihCXOuAPvXr_97v_bPg4",
    alt: "Letters S and H merging with magical sparkles to create one phonics sound",
    width: 400,
    height: 400,
  },
  rhyming: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuwNspmr9jQunHfis5uCrOtnGSsPJvZNOBjjAoZAQglcuvmMFhWUL8flutjeEKixUCWd83p1AF3OCmGu7tnzU_64_bh76G6RLNjbkTnCl3S9oXoEMa0FeUsfbu8UjZwPS7zXUgRfSvXAX0C4z_HVQb-LG6Ar7KM2kMg-FiYTqejJcgRDH1sXckYqcTH0AzQJ4fPm3H3lDm43_LTFGMEgeppBGdltrtmSB-fGHcWjQMANML7L5bbGToDU8QKJHwhWBK5izkHWR8XDs",
    alt: "Cute cartoon cat wearing a striped hat with floating pink hearts and musical notes",
    width: 400,
    height: 400,
  },
  tricky: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_czYJ6ZlxbJMyM_PmvOCLwdDZBBVCI8gRxKnKiJ7QK9IVVwOJtZfcyBbP2cOOMsd1kFT8oOT4yaeMSDgjhRo_h6Ad3XxTLczWD8hE72EVD3o4Gq1b0zC2JaVq8WHh9DmJ4mx_hO5ESDjJGszSD_tARfQ-NybUVNkF0ZhykAVhriDGlig6p3TEsCR_yt58d0CQZxUkiCyAUiytgxxJbyWnAIvtaj3BMJ2cdicNhmlLG2gDvP4c9023WloHS3bhMvfktywvDcM6dA4",
    alt: "Friendly book character holding the word THE with a magnifying glass",
    width: 400,
    height: 400,
  },
  blending: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6uqChATYXtpHgw97-RqIaEZClzDScJC9pRp0Hr8CypYvGftl2YEGe2d3li3vsuNN2j7pKktn5EukHObk37mCAn4ycSUDsdLGvrWZ6dxFqAG7REAVcvovwyqrbnfVer7iiHOdY5BO0KtvxcLworR8-RgWCP_YoCHypTJcXAXkYd_c_67OgWXLIzX8sWC4g1sekuMWYXZDuy8OmFPPNi-qR-sFb8KLMnJWY0T3Sy2F3JDL_djFArCbwv3lf0uRaklRUNUrht1EvzJM",
    alt: "Letters merging together in a CVC word",
    width: 400,
    height: 400,
  },

  // Science topics
  animal: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwWNTaaNPLnhMJxQnMBxnU4TgPXvzSgfDEOUQd3V_rpZEiyAdm8iq1rLNeTYJ3BfvuP8Fg5Zezjv8uh4bawX5I_9GYdJpK6FYh6wjQfZSiz3PpRBYO3qvE3HfE-mievOQJ4QsbST2SpgzHf0J_KmN34vsqnaLbw6aWWQKzRyl1QoGPr8FnyFJG7xe1tASnK1_1xaWSsJ2kYR60OfifeJCmD9cXdlbYuYIqMOwFKgANX8z4hA1ORKWnkK1eGZx4hb2sX-xPjwTa_3E",
    alt: "Friendly cartoon animals — dog, cat, parakeet, and goldfish",
    width: 400,
    height: 400,
  },
  plant: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMeoNaoxT4yZifW8cpVKY1X3Sjz780rbFrjS-zjHHaCCyfPpNwh4UcRe9Yq_HgLPvMPvTpBhNJXojK4Z9KGTW-QWG3Xr-WmQQ9KyXnrTGDYsSymg-p6rDMz4Zwx2SXYR5U-zZbaEOxD-bUiOV7QNAx2OY35gWkOg8urZzFtfO_u36ZDpV07jcUjcKM8Axg6JvbGKTDc-ZfBqM3AKP6tClWrwa2GHY95SZHxpnnZFfNrHK6YTU1nnCQcL0sDBqMK2q1OmjWfzbA994",
    alt: "Smiling cartoon sunflower with sun and water droplets",
    width: 400,
    height: 400,
  },
  body: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1kyulnE2_ddmKUhdK1N92_qbUirFlHXbONTwTZIEOjNchg3Xw7fYv3AMx_OyILqWQXAt-X3-A6hoHRwPRG-A104mVQ-15RdT6SohcGZYHgfWNoN-WVMozQlmrwdySRgsA8Bz956sCrqyNyCfD_NbGHEg8vxL292Pbke4FfE2stVo-B6g_75kIAb-RUZSBbykiCStbmhexzZnr8mvW2cAS8ALTMjs0uP1qcxULDaGVLPqo_wRUVHM0QP7z0cR9v_Yf5cAWjWJ7B5Y",
    alt: "Science illustration with plant, sun, and microscope",
    width: 400,
    height: 400,
  },
  living: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwWNTaaNPLnhMJxQnMBxnU4TgPXvzSgfDEOUQd3V_rpZEiyAdm8iq1rLNeTYJ3BfvuP8Fg5Zezjv8uh4bawX5I_9GYdJpK6FYh6wjQfZSiz3PpRBYO3qvE3HfE-mievOQJ4QsbST2SpgzHf0J_KmN34vsqnaLbw6aWWQKzRyl1QoGPr8FnyFJG7xe1tASnK1_1xaWSsJ2kYR60OfifeJCmD9cXdlbYuYIqMOwFKgANX8z4hA1ORKWnkK1eGZx4hb2sX-xPjwTa_3E",
    alt: "Living things illustration",
    width: 400,
    height: 400,
  },

  // Geography topics
  world: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPUXjd2bCbKeqPGkvR7LCyLnEuh8EhLmJ7XYZOhZkbcqmfe-X0eZelhsA3RVDQ3jopI-BeoxOur8NBHU2IXUI_scpNWwqB360ijvrkea_3uQlX_4UAS93bEy4MJO9KyMZ6sHB4vh1WHwe6M44Cc1Ce8AI05cvsVN3RNhNDkaN1gWeCpbgwheaq9nAOxiwRidhHclnnXa38uOGRtW4VHD7XBpUZKLn-7GA3jnZYpKPlxrhphWfXG-7U89MAu7wBV_bJLt3CpbRvXTY",
    alt: "Cartoon globe with airplane and world landmarks",
    width: 400,
    height: 400,
  },
  weather: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBg4vuLRrm4F5Kb4fDrUVumSZDWEjpNl7i--r2lu6AcuybuSdKgMhsUZW1yuCMhx4tlepbyXsCSr9u7z_tQKnmjC2nvfsCDLVVMGfA4_7x7e3wLJUp40Wn_E3ZiC0lZ-GmKNMF0aj56SPPM4YjPi08yDXDCz7Gn2h8dUCNHzsBSGnLDjle-1sYnTe-xzDRUWpC2f-033jHb5fVe0hjgJwonNsdNGlut22x-mOYeaAxWjy7A6nFMEOLiEj2_pUOo4XKvSpU2rwz-LnA",
    alt: "Smiling sun, cloud with raindrops, and snowflake",
    width: 400,
    height: 400,
  },
  uae: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCPUXjd2bCbKeqPGkvR7LCyLnEuh8EhLmJ7XYZOhZkbcqmfe-X0eZelhsA3RVDQ3jopI-BeoxOur8NBHU2IXUI_scpNWwqB360ijvrkea_3uQlX_4UAS93bEy4MJO9KyMZ6sHB4vh1WHwe6M44Cc1Ce8AI05cvsVN3RNhNDkaN1gWeCpbgwheaq9nAOxiwRidhHclnnXa38uOGRtW4VHD7XBpUZKLn-7GA3jnZYpKPlxrhphWfXG-7U89MAu7wBV_bJLt3CpbRvXTY",
    alt: "Globe showing world landmarks",
    width: 400,
    height: 400,
  },

  // History topics
  significant: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqvrf2OpYgDzrT7ErZoCvhxVvoAJkOXXLcPdMalFPVd8cCxmKRgpI7EeEpcAhvpbH6LWhOAfrt7lKGSwa4b_Ew6uLVdzOyoEy2Bz9ydTTM0yRljXhvTB--FtwlVJW9MF3sL5DKK6QXT1zFBOf4a9ebk-qWngGLACV0KcuCmEj6o_qMHQzbLubgC4YQ963921ZcrrXD8540o2SYcuY0Az5I5oM2UVETJJVjMk3Q-wAVeoChQfKqw9gCiPn2MNoyCfjYi_nXzmVuYk4",
    alt: "Medieval castle with crown and quill",
    width: 400,
    height: 400,
  },
  past: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAqvrf2OpYgDzrT7ErZoCvhxVvoAJkOXXLcPdMalFPVd8cCxmKRgpI7EeEpcAhvpbH6LWhOAfrt7lKGSwa4b_Ew6uLVdzOyoEy2Bz9ydTTM0yRljXhvTB--FtwlVJW9MF3sL5DKK6QXT1zFBOf4a9ebk-qWngGLACV0KcuCmEj6o_qMHQzbLubgC4YQ963921ZcrrXD8540o2SYcuY0Az5I5oM2UVETJJVjMk3Q-wAVeoChQfKqw9gCiPn2MNoyCfjYi_nXzmVuYk4",
    alt: "Castle from the past",
    width: 400,
    height: 400,
  },

  // PSHE topics
  emotion: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjPzwvSOnGLJhGaupxZiVkV8i1rcmNVJTrER5I6vRAwyMdHgmv6PtFm2mdyyt2toj0jnd6chfV-cqWsDkCdPsjd8OVSs-zqWXJy_wLajvAlu5A2YCqYpMBUQhRgb61lNN2Mscglg5B0jEBwo5Lg5Z6hRfJJH0Bhps--gUzOm1PAfFDSt85vmWHe5ZW58f34gJ-oWF_NNhWiocLOO1AAkh4Q10y8Hpg84P42W-yl78kdNZcltsRzpDuLlRjjX6rCA9q4PVYedx7cHw",
    alt: "Two cartoon hands holding each other with hearts and stars",
    width: 400,
    height: 400,
  },
  hygiene: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjPzwvSOnGLJhGaupxZiVkV8i1rcmNVJTrER5I6vRAwyMdHgmv6PtFm2mdyyt2toj0jnd6chfV-cqWsDkCdPsjd8OVSs-zqWXJy_wLajvAlu5A2YCqYpMBUQhRgb61lNN2Mscglg5B0jEBwo5Lg5Z6hRfJJH0Bhps--gUzOm1PAfFDSt85vmWHe5ZW58f34gJ-oWF_NNhWiocLOO1AAkh4Q10y8Hpg84P42W-yl78kdNZcltsRzpDuLlRjjX6rCA9q4PVYedx7cHw",
    alt: "Healthy choices illustration",
    width: 400,
    height: 400,
  },
  healthy: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjPzwvSOnGLJhGaupxZiVkV8i1rcmNVJTrER5I6vRAwyMdHgmv6PtFm2mdyyt2toj0jnd6chfV-cqWsDkCdPsjd8OVSs-zqWXJy_wLajvAlu5A2YCqYpMBUQhRgb61lNN2Mscglg5B0jEBwo5Lg5Z6hRfJJH0Bhps--gUzOm1PAfFDSt85vmWHe5ZW58f34gJ-oWF_NNhWiocLOO1AAkh4Q10y8Hpg84P42W-yl78kdNZcltsRzpDuLlRjjX6rCA9q4PVYedx7cHw",
    alt: "Friendship and kindness illustration",
    width: 400,
    height: 400,
  },
};

// ===== Empty state illustrations =====
export const EMPTY_STATE_IMAGES: Record<"library" | "reports" | "bank" | "settings", BankImage> = {
  library: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfGGevc1vPEZEUNCkFBY__3u9236NVc-78QCeqnmHuXd_zvWsnJolvM4qeTvyGvFybhHRd0DbB8xHtp2ux4ZUv5m59CQzwJU3FoCi1jzwQ90dQUnjme0wDKajbYWpuvOM7g1xphAJAtb4nKSL7nDib7vtrQcMqVxspZRwKAyJqOYWaaPpyZdCHJSb5AMyXNcpcCSw_uKPpyoH-JwU7WbX3UE6hb8RxHYX4U1um5X_X8BoEC9TXUkP1nS2mV5cdY_Ao41HfwAoM5JE",
    alt: "Whimsical hand-drawn cartoon of a wooden bookshelf with one friendly book character peeking out and a tiny speech bubble saying build me",
    width: 400,
    height: 400,
  },
  reports: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBaj2ivfkSRHr547vPgxSBgFzdDdnd3PZSV7be4-ihZxNzdPAodMsM8tZL5AL053geYPpNlYSIlpqXsNFrx6IoV8CckExsB5_rpIWLpNoFkjh_yROIYjdFaZaEC6D28Gd1OdWQOi9n_UJBfQuckLpURFqLUEDt--mtwhqtorcVaB6eUTUQfEDlFGnxkKyPn8W6xEImumOCXRyukfkSg_gsIHLSvh_44vjpo3AR_6cs3RFmeU8i7DGKYuSJJjUu1sp7Q1n7bZEDblzc",
    alt: "Cute cartoon clipboard with a smiling face floating alongside a playful pencil and tiny sparkling gold stars",
    width: 400,
    height: 400,
  },
  bank: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBcVrDdBeqBUC0dUUnIlxPVMWDNypzI_IgYaU7qq6ON-NOn1P3BoUU-Txzas4lsT9ub3Cj_-kyQcX4Ka5DnxE_uKJCzWWV0ZKGZffXjjjR0JMBVK5we0FaIAoBw7226p7_o1f5KgbRkYZaMAsmIjVlckOvHPyhH5-QSYAtF4xRdkgpgYUUyp-nbeXV6-oS8owYEaP8r-Y88PL7zDemsyjaS3RNOYXQk0S6IbEQFiHi2E2hXap_TnIB-B9on3aWdC67mxjgMDKV4WI",
    alt: "Magical open cartoon backpack with colorful rainbows and sparkles coming out of the main pocket",
    width: 400,
    height: 400,
  },
  settings: {
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCU4LKneYOqcKLNyxvSL-m2Ki7VBSEGGDqTNkJzt652D50hGhK05QjZXRr12_K-FSlM5gjCAad0IDtMR8lYcUoHQfNdkA6c3zzdMb2jIM-7DRCDslIf_wAG6czSr1bKfZqviUUKLcOaEbxOskKieLKGhwgnp36pjs2v3c3VoSLZS_N8zSuPXptF5wbdLYzQhejeUTuKxH2EjeVSLF9cJJlp5JHSYiVQ-mOqHFSjf6yPnCKM1rx1AFuxbRfRIs7hm_GV1wpBpEiEtXo",
    alt: "Friendly cartoon gear character with big expressive eyes and a happy smile holding a wrench",
    width: 400,
    height: 400,
  },
};

/**
 * Resolve the most specific image for a bank activity.
 * 1. Try matching topic substring against TOPIC_IMAGES
 * 2. Fall back to subject-level image
 */
export function getActivityImage(activity: BankActivity | { subject?: string | null; topic?: string | null }): BankImage {
  const topic = (activity.topic ?? "").toLowerCase();
  if (topic) {
    for (const [key, img] of Object.entries(TOPIC_IMAGES)) {
      if (topic.includes(key)) return img;
    }
  }
  const subjectKey = (activity.subject ?? "maths") as SubjectKey;
  return SUBJECT_IMAGES[subjectKey] ?? SUBJECT_IMAGES.maths;
}

/**
 * Subject metadata: display name, gradient pair, and content tag.
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
