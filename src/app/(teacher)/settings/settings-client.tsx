"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { KineticHeadline } from "@/components/ui/KineticHeadline";
import { SPRING, TRANSITION } from "@/lib/design/motion";

interface Props {
  email: string;
  initialName: string;
  initialSchool: string;
  initialClassroom: string;
  initialRole: string;
}

const ROLE_OPTIONS = [
  { value: "class_teacher", label: "Class Teacher" },
  { value: "assistant_teacher", label: "Assistant Teacher" },
  { value: "teaching_assistant", label: "Teaching Assistant" },
  { value: "specialist", label: "Specialist" },
  { value: "head_of_year", label: "Head of Year" },
  { value: "other", label: "Other" },
];

export function SettingsClient({
  email,
  initialName,
  initialSchool,
  initialClassroom,
  initialRole,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [schoolName, setSchoolName] = useState(initialSchool);
  const [classroom, setClassroom] = useState(initialClassroom);
  const [role, setRole] = useState(initialRole);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSave() {
    setSavingProfile(true);
    setSaved(false);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("teachers")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ name, school_name: schoolName, classroom, role } as any)
        .eq("id", user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <KineticHeadline as="h1" size="lg" tone="on-surface" rotate={-1}>
          Settings
        </KineticHeadline>
        <p className="text-on-surface-variant font-body mt-2 text-lg">
          Your profile and account
        </p>
      </div>

      {/* Profile section */}
      <section className="bg-surface-container-lowest rounded-xl ambient-shadow p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-3xl shadow-lg"
            aria-hidden="true"
          >
            🧑‍🏫
          </div>
          <div>
            <h2 className="font-headline font-black text-xl text-on-surface">Profile</h2>
            <p className="text-sm text-on-surface-variant font-body">{email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-xs uppercase tracking-widest font-bold text-on-surface-variant block"
            >
              Display Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="focus-ring w-full h-12 px-4 rounded-2xl bg-surface-container-low border-none focus:bg-surface-container-lowest text-on-surface font-body outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="school"
              className="text-xs uppercase tracking-widest font-bold text-on-surface-variant block"
            >
              School
            </label>
            <input
              id="school"
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              autoComplete="organization"
              className="focus-ring w-full h-12 px-4 rounded-2xl bg-surface-container-low border-none focus:bg-surface-container-lowest text-on-surface font-body outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="classroom"
              className="text-xs uppercase tracking-widest font-bold text-on-surface-variant block"
            >
              Classroom
            </label>
            <input
              id="classroom"
              type="text"
              value={classroom}
              onChange={(e) => setClassroom(e.target.value)}
              placeholder="Discovery Class · Year 1B · Sunshine Room"
              className="focus-ring w-full h-12 px-4 rounded-2xl bg-surface-container-low border-none focus:bg-surface-container-lowest text-on-surface font-body outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="role"
              className="text-xs uppercase tracking-widest font-bold text-on-surface-variant block"
            >
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="focus-ring w-full h-12 px-4 rounded-2xl bg-surface-container-low border-none focus:bg-surface-container-lowest text-on-surface font-body outline-none transition-colors"
            >
              <option value="">Pick a role…</option>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={savingProfile}
              className="focus-ring h-12 px-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-bold inline-flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {savingProfile ? (
                <>
                  <span className="material-symbols-outlined animate-spin" aria-hidden="true">
                    progress_activity
                  </span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" aria-hidden="true">
                    save
                  </span>
                  Save Changes
                </>
              )}
            </button>
            <AnimatePresence>
              {saved && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={TRANSITION.fast}
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2 text-tertiary font-bold font-body text-sm"
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    check_circle
                  </span>
                  Saved
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-error-container/40 rounded-xl p-6 md:p-8 space-y-4 border border-error-container">
        <h2 className="font-headline font-black text-xl text-on-error-container">Danger Zone</h2>
        <p className="text-sm text-on-error-container/80 font-body">
          Signing out will end your session. Your activities and class data are safe.
        </p>
        {!confirmSignOut ? (
          <button
            onClick={() => setConfirmSignOut(true)}
            className="focus-ring h-12 px-6 rounded-full bg-error text-white font-headline font-bold inline-flex items-center gap-2 shadow-md"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              logout
            </span>
            Sign Out
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING.snappy}
            className="flex items-center gap-3 flex-wrap"
            role="alertdialog"
          >
            <p className="font-body font-bold text-on-error-container">Sure?</p>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="focus-ring h-12 px-6 rounded-full bg-error text-white font-headline font-bold inline-flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {signingOut ? "Signing out..." : "Yes, sign me out"}
            </button>
            <button
              onClick={() => setConfirmSignOut(false)}
              disabled={signingOut}
              className="focus-ring h-12 px-6 rounded-full bg-surface-container-lowest text-on-surface font-headline font-bold disabled:opacity-50"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </section>
    </div>
  );
}
