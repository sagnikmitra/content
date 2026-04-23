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

      const redirectPath =
        location?.state?.from?.pathname ||
        location?.state?.from ||
        "/";

      navigate(redirectPath, { replace: true });
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
          <p className="text-xs uppercase tracking-[0.18em] text-[#8eb2df]">
            ContentOS by sgnk
          </p>
          <h2 className="mt-1 text-2xl font-semibold">Welcome back</h2>
          <p className="mt-1 text-sm text-[#a8c3ea]">
            Sign in to manage your publishing workspace.
          </p>
        </div>
        {typeof onBack === "function" && (
          <button
            onClick={onBack}
            className="rounded-lg border border-[#7fb1ff33] px-3 py-1.5 text-sm text-[#cfe0ff] transition hover:border-[#7fb1ff66]"
            type="button"
          >
            Back
          </button>
        )}
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1">
          <span className="text-xs text-[#9eb9e1]">Email / Username</span>
          <input
            value={currentIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
            disabled={Boolean(fixedIdentifier)}
            className="h-11 rounded-xl border border-[#466694] bg-[#08172c] px-3 text-[#e7f0ff] outline-none ring-0 transition placeholder:text-[#7391bb] focus:border-[#5aa2eb] disabled:cursor-not-allowed disabled:border-[#324e75] disabled:text-[#8ea9ce]"
            placeholder="you@example.com or username"
            autoComplete="username"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-[#9eb9e1]">Password</span>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#466694] bg-[#08172c] px-3 pr-10 text-[#e7f0ff] outline-none ring-0 transition placeholder:text-[#7391bb] focus:border-[#5aa2eb]"
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-[15px] text-[#9eb9e1] transition hover:text-[#d6e7ff]"
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
          className="mt-1 h-11 rounded-xl border border-[#7fe0ff73] bg-[linear-gradient(130deg,#53c8ff,#67f0d6)] text-[#06263b] font-semibold transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-55"
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
