import { loginWithPassword } from "@api/auth";
import {
  persistCredentials,
  setCredentials,
} from "@store/slices/profileSlice";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const isSafeLocalPath = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

const getRedirectPath = (location) => {
  const stateFrom = location?.state?.from;
  const stateRedirect =
    typeof stateFrom === "string"
      ? stateFrom
      : stateFrom?.pathname
        ? `${stateFrom.pathname}${stateFrom.search || ""}${stateFrom.hash || ""}`
        : null;

  if (isSafeLocalPath(stateRedirect)) {
    return stateRedirect;
  }

  const params = new URLSearchParams(location?.search || "");
  const nextRedirect = params.get("next");
  if (isSafeLocalPath(nextRedirect)) {
    return nextRedirect;
  }

  return "/";
};

export default function ExistingPassword({
  identifier,
  defaultIdentifier = "",
  onBack,
  hideForgotPassword = false,
}) {
  const [loginIdentifier, setLoginIdentifier] = useState(
    (identifier || defaultIdentifier || "").trim()
  );
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const fixedIdentifier = (identifier || "").trim();
  const currentIdentifier = (fixedIdentifier || loginIdentifier).trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!currentIdentifier) {
      setErr("Email or username is required");
      return;
    }

    if (!pwd.trim()) {
      setErr("Password is required");
      return;
    }

    setLoading(true);
    try {
      const data = await loginWithPassword({
        identifier: currentIdentifier,
        password: pwd,
      });
      const token = data?.token || data?.accessToken;

      if (!token) {
        throw new Error(data?.message || "Authentication failed");
      }

      const rawUser = data?.user ?? data?.profile ?? null;
      const sanitizedUser =
        rawUser && typeof rawUser === "object"
          ? {
              ...rawUser,
              avatarUrl: rawUser.avatarUrl ?? null,
            }
          : rawUser;

      dispatch(setCredentials({ token, user: sanitizedUser }));
      persistCredentials({ token, user: sanitizedUser });
      toast.success("Signed in successfully");

      navigate(getRedirectPath(location), { replace: true });
    } catch (error) {
      const message =
        error?.message ||
        error?.response?.data?.message ||
        "Failed to sign in";
      setErr(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#9da1a6]">
            Markex by ZS
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Welcome back</h2>
          <p className="mt-1 text-sm text-[#a5a7ab]">
            Sign in to manage your publishing workspace.
          </p>
        </div>
        {typeof onBack === "function" && (
          <button
            onClick={onBack}
            className="rounded-lg border border-[#3c3c3c] px-3 py-1.5 text-sm text-[#d4d4d4] transition hover:border-[#5b5b5b]"
            type="button"
          >
            Back
          </button>
        )}
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1">
          <span className="text-xs text-[#9da1a6]">Email / Username</span>
          <input
            value={currentIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
            disabled={Boolean(fixedIdentifier)}
            className="h-11 rounded-xl border border-[#3c3c3c] bg-[#252526] px-3 text-[#d4d4d4] outline-none ring-0 transition placeholder:text-[#8e8e90] focus:border-[#5b5b5b] disabled:cursor-not-allowed disabled:border-[#2f2f2f] disabled:text-[#8e8e90]"
            placeholder="you@example.com or username"
            autoComplete="username"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-[#9da1a6]">Password</span>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#3c3c3c] bg-[#252526] px-3 pr-10 text-[#d4d4d4] outline-none ring-0 transition placeholder:text-[#8e8e90] focus:border-[#5b5b5b]"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-[15px] text-[#9da1a6] transition hover:text-[#d4d4d4]"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </label>

        {err && <p className="text-xs text-[#ff9ca7]">{err}</p>}

        <button
          type="submit"
          disabled={loading || !currentIdentifier || !pwd.trim()}
          className="mt-1 h-11 rounded-xl border border-[#666] bg-[#3a3d41] text-[#f4f4f4] font-semibold transition hover:bg-[#45484d] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {!hideForgotPassword && (
        <div className="mt-3 text-xs text-right">
          <a
            href="/forgot"
            className="text-neutral-400 hover:text-neutral-200 underline underline-offset-2"
          >
            Forgot password?
          </a>
        </div>
      )}
    </div>
  );
}
