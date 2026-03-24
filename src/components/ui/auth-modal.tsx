"use client"

import React, { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { useAuth } from "@/contexts/AuthContext"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "signin" | "register"
}

// ── Spinner ──
function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export function AuthModal({
  isOpen,
  onClose,
  mode: initialMode,
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "register">(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [socialLoading, setSocialLoading] = useState<
    "google" | "facebook" | null
  >(null)
  const { login, register, loginWithGoogle, loginWithFacebook, loading } =
    useAuth()

  // Sync mode when prop changes
  useEffect(() => {
    setMode(initialMode)
    setError("")
    setFieldErrors({})
  }, [initialMode, isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("")
      setPassword("")
      setName("")
      setError("")
      setFieldErrors({})
      setShowPassword(false)
      setSocialLoading(null)
    }
  }, [isOpen])

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (mode === "register" && !name.trim()) {
      errors.name = "Name is required"
    }

    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email"
    }

    if (!password) {
      errors.password = "Password is required"
    } else if (password.length < 6) {
      errors.password = "At least 6 characters"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validate()) return

    try {
      if (mode === "signin") {
        await login(email, password)
      } else {
        await register(email, password, name)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    try {
      setError("")
      setSocialLoading(provider)
      if (provider === "google") {
        await loginWithGoogle()
      } else {
        await loginWithFacebook()
      }
      onClose()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `${provider === "google" ? "Google" : "Facebook"} login failed`
      )
    } finally {
      setSocialLoading(null)
    }
  }

  const switchMode = () => {
    setMode(mode === "signin" ? "register" : "signin")
    setError("")
    setFieldErrors({})
  }

  const isSubmitting = loading || socialLoading !== null

  return (
    <Modal open={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-6 p-6 pt-8">
        {/* ── Header ── */}
        <div className="flex flex-col items-center gap-2 text-center">
          <img
            src="/photos/Default/TumboLogo.png"
            alt="Tümbo"
            className="h-6 object-contain mb-1"
          />
          <h2 className="text-[20px] font-bold text-gray-900">
            {mode === "signin"
              ? "Welcome back"
              : "Create your account"}
          </h2>
          <p className="text-[13px] text-gray-400 max-w-[280px]">
            {mode === "signin"
              ? "Sign in to access your saved classes and preferences."
              : "Join Tümbo to save classes and get personalised recommendations."}
          </p>
        </div>

        {/* ── Social buttons ── */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2.5 w-full h-11 rounded-lg border border-neutral-200 bg-white text-[14px] font-medium text-gray-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {socialLoading === "google" ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("facebook")}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2.5 w-full h-11 rounded-lg border border-neutral-200 bg-white text-[14px] font-medium text-gray-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {socialLoading === "facebook" ? (
              <Spinner className="w-4 h-4" />
            ) : (
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                <path
                  fill="#1877F2"
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
            )}
            Continue with Facebook
          </button>
        </div>

        {/* ── Divider ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-[11px] font-medium text-gray-300 uppercase tracking-wider">
            or
          </span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name field (register only) */}
          {mode === "register" && (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-name"
                className="text-[13px] font-medium text-gray-700"
              >
                Full name
              </label>
              <input
                id="auth-name"
                type="text"
                placeholder="e.g. Sarah Johnson"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (fieldErrors.name)
                    setFieldErrors((p) => ({ ...p, name: "" }))
                }}
                disabled={isSubmitting}
                className={`h-11 rounded-lg border bg-white px-3.5 text-[14px] text-gray-900 placeholder-gray-300 outline-none transition-all duration-150 focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 focus:border-[var(--tumbo-orange)]/40 disabled:opacity-50 ${
                  fieldErrors.name
                    ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                    : "border-neutral-200"
                }`}
              />
              {fieldErrors.name && (
                <span className="text-[12px] text-red-500">
                  {fieldErrors.name}
                </span>
              )}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-email"
              className="text-[13px] font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email)
                  setFieldErrors((p) => ({ ...p, email: "" }))
              }}
              disabled={isSubmitting}
              className={`h-11 rounded-lg border bg-white px-3.5 text-[14px] text-gray-900 placeholder-gray-300 outline-none transition-all duration-150 focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 focus:border-[var(--tumbo-orange)]/40 disabled:opacity-50 ${
                fieldErrors.email
                  ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                  : "border-neutral-200"
              }`}
            />
            {fieldErrors.email && (
              <span className="text-[12px] text-red-500">
                {fieldErrors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-password"
              className="text-[13px] font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                placeholder={
                  mode === "register" ? "At least 6 characters" : "Enter your password"
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password)
                    setFieldErrors((p) => ({ ...p, password: "" }))
                }}
                disabled={isSubmitting}
                className={`h-11 w-full rounded-lg border bg-white px-3.5 pr-10 text-[14px] text-gray-900 placeholder-gray-300 outline-none transition-all duration-150 focus:ring-2 focus:ring-[var(--tumbo-orange)]/20 focus:border-[var(--tumbo-orange)]/40 disabled:opacity-50 ${
                  fieldErrors.password
                    ? "border-red-300 focus:ring-red-200 focus:border-red-400"
                    : "border-neutral-200"
                }`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="text-[12px] text-red-500">
                {fieldErrors.password}
              </span>
            )}
          </div>

          {/* Global error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100">
              <svg
                className="w-4 h-4 text-red-500 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
              <span className="text-[13px] text-red-600">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-lg bg-[var(--tumbo-orange)] text-white text-[14px] font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed border-0 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner className="w-4 h-4" />
                <span>
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </span>
              </>
            ) : mode === "signin" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* ── Footer: Switch mode ── */}
        <div className="text-center text-[13px] text-gray-400 pb-2">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={switchMode}
                disabled={isSubmitting}
                className="font-semibold text-[var(--tumbo-orange)] hover:underline bg-transparent border-0 cursor-pointer disabled:opacity-50"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={switchMode}
                disabled={isSubmitting}
                className="font-semibold text-[var(--tumbo-orange)] hover:underline bg-transparent border-0 cursor-pointer disabled:opacity-50"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
