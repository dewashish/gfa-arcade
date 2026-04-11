"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { SPRING, TRANSITION, EASING } from "@/lib/design/motion";

type Mode = "signin" | "signup";
type SignupStep = "credentials" | "name" | "classroom" | "role";

const ROLES = [
  { value: "class_teacher", label: "Class Teacher", emoji: "👩‍🏫" },
  { value: "assistant_teacher", label: "Assistant Teacher", emoji: "🧑‍🏫" },
  { value: "teaching_assistant", label: "Teaching Assistant", emoji: "📚" },
  { value: "specialist", label: "Specialist", emoji: "🎨" },
  { value: "head_of_year", label: "Head of Year", emoji: "👑" },
  { value: "other", label: "Other", emoji: "✨" },
];

const FLOATING_SHAPES = [
  { emoji: "⭐", x: "8%", y: "12%", size: "text-5xl", delay: 0, duration: 6 },
  { emoji: "🚀", x: "85%", y: "15%", size: "text-4xl", delay: 1.2, duration: 7 },
  { emoji: "🎈", x: "12%", y: "78%", size: "text-5xl", delay: 0.6, duration: 5.5 },
  { emoji: "🌈", x: "82%", y: "75%", size: "text-4xl", delay: 1.8, duration: 6.5 },
  { emoji: "📚", x: "18%", y: "45%", size: "text-3xl", delay: 0.3, duration: 8 },
  { emoji: "🎨", x: "78%", y: "48%", size: "text-3xl", delay: 1.5, duration: 7.5 },
  { emoji: "✏️", x: "5%", y: "30%", size: "text-3xl", delay: 0.9, duration: 6 },
  { emoji: "🍎", x: "90%", y: "32%", size: "text-3xl", delay: 2.1, duration: 7 },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [signupStep, setSignupStep] = useState<SignupStep>("credentials");

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [classroom, setClassroom] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 3D tilt state — tracks mouse over the card and applies rotateX/Y
  const cardRef = useRef<HTMLDivElement>(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useTransform(tiltY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(tiltX, [-0.5, 0.5], [-10, 10]);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 22 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 22 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    tiltX.set((e.clientX - rect.left) / rect.width - 0.5);
    tiltY.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function handleMouseLeave() {
    tiltX.set(0);
    tiltY.set(0);
  }

  // ===== Submit handlers =====
  async function handleSignin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function handleSignupComplete() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split("@")[0],
          classroom: classroom || null,
          role: role || null,
        },
      },
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      // Roll back to credentials step so they can fix the email/password
      setSignupStep("credentials");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  function nextSignupStep() {
    setError("");
    if (signupStep === "credentials") {
      if (!email || password.length < 6) {
        setError("Email + password (min 6 characters) please.");
        return;
      }
      setSignupStep("name");
    } else if (signupStep === "name") {
      if (!name.trim()) {
        setError("What should we call you?");
        return;
      }
      setSignupStep("classroom");
    } else if (signupStep === "classroom") {
      if (!classroom.trim()) {
        setError("Pick a name for your class.");
        return;
      }
      setSignupStep("role");
    } else if (signupStep === "role") {
      if (!role) {
        setError("Pick a role.");
        return;
      }
      handleSignupComplete();
    }
  }

  function prevSignupStep() {
    setError("");
    if (signupStep === "name") setSignupStep("credentials");
    else if (signupStep === "classroom") setSignupStep("name");
    else if (signupStep === "role") setSignupStep("classroom");
  }

  // Reset signup flow when toggling
  useEffect(() => {
    setError("");
    if (mode === "signin") setSignupStep("credentials");
  }, [mode]);

  const SIGNUP_STEPS: SignupStep[] = ["credentials", "name", "classroom", "role"];
  const currentStepIndex = SIGNUP_STEPS.indexOf(signupStep);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* ===== Gradient Mesh Background ===== */}
      <div className="absolute inset-0 bg-background" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background: `
              radial-gradient(at 18% 20%, #cfe5ff 0%, transparent 40%),
              radial-gradient(at 85% 15%, #ffdea8 0%, transparent 45%),
              radial-gradient(at 25% 80%, #63f9e8 0%, transparent 40%),
              radial-gradient(at 80% 75%, #ffdad6 0%, transparent 45%),
              radial-gradient(at 50% 50%, #ffffff 0%, transparent 70%)
            `,
          }}
        />
        {/* Subtle animated noise / shimmer */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 40%, rgba(46,151,230,0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(254,183,0,0.15) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* ===== Floating Decorative Shapes ===== */}
      {FLOATING_SHAPES.map((shape, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className={`absolute pointer-events-none ${shape.size} select-none`}
          style={{ left: shape.x, top: shape.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0.6, 0.4, 0.6],
            scale: [0, 1, 1.05, 0.95, 1],
            y: [0, -20, 0, 15, 0],
            rotate: [0, 8, -5, 6, 0],
          }}
          transition={{
            opacity: { duration: 1.2, delay: shape.delay },
            scale: { duration: 1.2, delay: shape.delay, ease: EASING.bouncy },
            y: { duration: shape.duration, repeat: Infinity, ease: "easeInOut", delay: shape.delay },
            rotate: { duration: shape.duration * 1.3, repeat: Infinity, ease: "easeInOut", delay: shape.delay },
          }}
        >
          {shape.emoji}
        </motion.div>
      ))}

      {/* ===== Brand Header ===== */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING.snappy}
        className="absolute top-8 left-1/2 -translate-x-1/2 text-center z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-1">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-xl"
          >
            <span className="material-symbols-outlined text-white text-2xl">school</span>
          </motion.div>
          <div className="text-left">
            <h1 className="font-headline font-black text-2xl text-primary leading-tight">
              Adventure Hub
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">
              GEMS Founders School · Masdar City
            </p>
          </div>
        </div>
      </motion.div>

      {/* ===== Tilt Card ===== */}
      <div
        className="relative z-10 w-full max-w-xl"
        style={{ perspective: 1200 }}
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: springX,
            rotateY: springY,
            transformStyle: "preserve-3d",
          }}
          initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ ...SPRING.bouncy, delay: 0.2 }}
          className="bg-white/85 backdrop-blur-xl rounded-xl ambient-shadow-lg p-8 md:p-12 relative"
        >
          {/* Specular highlight */}
          <div
            className="absolute inset-0 rounded-xl pointer-events-none opacity-30"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 50%)",
              transform: "translateZ(20px)",
            }}
            aria-hidden="true"
          />

          {/* Mode toggle pills */}
          <div
            role="radiogroup"
            aria-label="Mode"
            className="flex bg-surface-container-low rounded-full p-1 mb-8 max-w-xs mx-auto"
            style={{ transform: "translateZ(30px)" }}
          >
            {[
              { key: "signin", label: "Sign In" },
              { key: "signup", label: "Sign Up" },
            ].map((opt) => (
              <button
                key={opt.key}
                role="radio"
                aria-checked={mode === opt.key}
                onClick={() => setMode(opt.key as Mode)}
                className={`focus-ring flex-1 h-11 rounded-full font-headline font-bold text-sm transition-colors ${
                  mode === opt.key
                    ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-lg"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* ===== Sign In ===== */}
          <AnimatePresence mode="wait">
            {mode === "signin" && (
              <motion.form
                key="signin"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={TRANSITION.base}
                onSubmit={handleSignin}
                className="space-y-5"
                style={{ transform: "translateZ(20px)" }}
              >
                <motion.h2
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -1 }}
                  className="font-headline font-black text-3xl md:text-4xl text-on-surface text-center origin-center"
                >
                  Welcome <span className="text-primary">back!</span>
                </motion.h2>
                <p className="text-on-surface-variant text-center font-body">
                  Log in to start your adventure
                </p>

                <FieldInput
                  label="Email"
                  icon="mail"
                  type="email"
                  autoComplete="email"
                  placeholder="teacher@gemsfounders.ae"
                  value={email}
                  onChange={setEmail}
                />
                <FieldInput
                  label="Password"
                  icon="lock"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={setPassword}
                />

                {error && <ErrorBanner message={error} />}

                <BigButton type="submit" loading={loading}>
                  Log In
                </BigButton>
              </motion.form>
            )}

            {/* ===== Sign Up Wizard ===== */}
            {mode === "signup" && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={TRANSITION.base}
                style={{ transform: "translateZ(20px)" }}
              >
                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {SIGNUP_STEPS.map((s, i) => (
                    <motion.div
                      key={s}
                      animate={{
                        width: i === currentStepIndex ? 32 : 12,
                        backgroundColor:
                          i <= currentStepIndex ? "#00629e" : "#e4e2e2",
                      }}
                      className="h-2 rounded-full"
                      transition={SPRING.snappy}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {/* Step 1: Credentials */}
                  {signupStep === "credentials" && (
                    <SignupStepCard
                      key="credentials"
                      title={
                        <>
                          Let&apos;s <span className="text-primary">begin!</span>
                        </>
                      }
                      subtitle="Pick an email and password"
                    >
                      <FieldInput
                        label="Email"
                        icon="mail"
                        type="email"
                        autoComplete="email"
                        placeholder="teacher@gemsfounders.ae"
                        value={email}
                        onChange={setEmail}
                      />
                      <FieldInput
                        label="Password"
                        icon="lock"
                        type="password"
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={setPassword}
                      />
                    </SignupStepCard>
                  )}

                  {/* Step 2: Name */}
                  {signupStep === "name" && (
                    <SignupStepCard
                      key="name"
                      title={
                        <>
                          What&apos;s your <span className="text-primary">name?</span>
                        </>
                      }
                      subtitle="The kids will see this"
                    >
                      <FieldInput
                        label="Display Name"
                        icon="person"
                        autoComplete="name"
                        placeholder="Ms. Sarah"
                        value={name}
                        onChange={setName}
                        autoFocus
                      />
                    </SignupStepCard>
                  )}

                  {/* Step 3: Classroom */}
                  {signupStep === "classroom" && (
                    <SignupStepCard
                      key="classroom"
                      title={
                        <>
                          Your <span className="text-primary">classroom?</span>
                        </>
                      }
                      subtitle="What's your class called?"
                    >
                      <FieldInput
                        label="Classroom"
                        icon="meeting_room"
                        placeholder="Discovery Class · Year 1B · Sunshine Room"
                        value={classroom}
                        onChange={setClassroom}
                        autoFocus
                      />
                    </SignupStepCard>
                  )}

                  {/* Step 4: Role */}
                  {signupStep === "role" && (
                    <SignupStepCard
                      key="role"
                      title={
                        <>
                          And your <span className="text-primary">role?</span>
                        </>
                      }
                      subtitle="Pick the one that fits best"
                    >
                      <div
                        role="radiogroup"
                        aria-label="Role"
                        className="grid grid-cols-2 gap-3"
                      >
                        {ROLES.map((r) => (
                          <motion.button
                            key={r.value}
                            type="button"
                            role="radio"
                            aria-checked={role === r.value}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setRole(r.value)}
                            className={`focus-ring p-4 rounded-2xl text-left transition-colors ${
                              role === r.value
                                ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-lg"
                                : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                            }`}
                          >
                            <div className="text-3xl mb-2" aria-hidden="true">
                              {r.emoji}
                            </div>
                            <div className="font-headline font-bold text-sm leading-tight">
                              {r.label}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </SignupStepCard>
                  )}
                </AnimatePresence>

                {error && <ErrorBanner message={error} />}

                <div className="flex gap-3 mt-6">
                  {signupStep !== "credentials" && (
                    <button
                      type="button"
                      onClick={prevSignupStep}
                      className="focus-ring h-12 px-6 rounded-full bg-surface-container-low hover:bg-surface-container text-primary font-headline font-bold transition-colors"
                    >
                      Back
                    </button>
                  )}
                  <BigButton onClick={nextSignupStep} loading={loading} flexible>
                    {signupStep === "role" ? "Create Account" : "Next"}
                  </BigButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// ===== Helper components =====

function SignupStepCard({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -20 }}
      transition={SPRING.snappy}
      className="space-y-5"
    >
      <div className="text-center">
        <motion.h2
          initial={{ rotate: 0 }}
          animate={{ rotate: -1 }}
          className="font-headline font-black text-3xl md:text-4xl text-on-surface origin-center"
        >
          {title}
        </motion.h2>
        <p className="text-on-surface-variant font-body mt-1">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}

function FieldInput({
  label,
  icon,
  type = "text",
  placeholder,
  value,
  onChange,
  autoFocus,
  autoComplete,
}: {
  label: string;
  icon: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs uppercase tracking-widest font-bold text-on-surface-variant block">
        {label}
      </label>
      <div className="relative group">
        <span
          className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl pointer-events-none transition-colors group-focus-within:text-primary"
          aria-hidden="true"
        >
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          required
          className="focus-ring w-full h-14 pl-14 pr-5 rounded-2xl bg-surface-container-low border-none focus:bg-white text-on-surface font-body text-lg outline-none placeholder:text-outline-variant transition-colors"
        />
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className="bg-error-container text-on-error-container rounded-2xl p-4 flex items-center gap-3"
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        error
      </span>
      <p className="text-sm font-body font-bold flex-1">{message}</p>
    </motion.div>
  );
}

function BigButton({
  children,
  onClick,
  loading,
  type = "button",
  flexible,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  type?: "button" | "submit";
  flexible?: boolean;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: loading ? 1 : 1.03 }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
      className={`focus-ring h-14 rounded-full bg-gradient-to-br from-primary to-primary-container text-white font-headline font-black text-lg shadow-xl inline-flex items-center justify-center gap-3 disabled:opacity-50 ${
        flexible ? "flex-1" : "w-full"
      }`}
    >
      {loading ? (
        <>
          <span className="material-symbols-outlined animate-spin" aria-hidden="true">
            progress_activity
          </span>
          Hold on...
        </>
      ) : (
        <>
          {children}
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_forward
          </span>
        </>
      )}
    </motion.button>
  );
}
