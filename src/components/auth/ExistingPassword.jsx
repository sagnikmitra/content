import { loginWithPassword } from "@api/auth";
import {
  persistCredentials,
  setCredentials,
} from "@store/slices/profileSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ExistingPassword({
  identifier,
  onBack,
  hideForgotPassword = false,
}) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);

    if (!pwd.trim()) {
      setErr("Password is required");
      return;
    }

    setLoading(true);
    try {
      const data = await loginWithPassword({ identifier, password: pwd });
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
        <h2 className="text-lg font-semibold">Welcome back</h2>
        {typeof onBack === "function" && (
          <button
            onClick={onBack}
            className="text-sm text-neutral-400 hover:text-neutral-200"
            type="button"
          >
            Back
          </button>
        )}
      </div>

      <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
        <label className="grid gap-1">
          <span className="text-xs text-neutral-400">Email / Username</span>
          <input
            value={identifier}
            disabled
            className="h-11 rounded-xl bg-neutral-950 border border-neutral-800 px-3 text-neutral-400"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-neutral-400">Password</span>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="h-11 rounded-xl bg-neutral-950 border border-neutral-700 px-3 outline-none "
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </label>

        {err && <p className="text-xs text-rose-400">{err}</p>}

        <button
          type="submit"
          disabled={loading || !pwd.trim()}
          className="h-11 rounded-xl bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white focus:outline-none"
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
