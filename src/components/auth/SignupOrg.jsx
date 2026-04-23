import { createEntryAccount } from "@api/auth";
import {
  persistCredentials,
  setCredentials,
} from "@store/slices/profileSlice";
import { strongPassword } from "@utils/auth/authUtils";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PasswordHints from "./PasswordHints";

export default function SignupOrg({ email, onBack }) {
  const [org, setOrg] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const checks = strongPassword(pwd);
  const disabled = !org.trim() || !checks.ok || loading;

  const submit = async () => {
    setErr(null);

    if (!org.trim()) {
      setErr("Organization name is required");
      return;
    }

    if (!checks.ok) {
      setErr("Password does not meet requirements");
      return;
    }

    setLoading(true);

    try {
      const data = await createEntryAccount({
        email,
        organization: org.trim(),
        password: pwd,
      });

      const token = data?.token || data?.accessToken;

      if (!token) {
        throw new Error(data?.message || "Failed to create account");
      }

      const user = data?.user ?? data?.profile ?? null;

      dispatch(setCredentials({ token, user }));
      persistCredentials({ token, user });
      toast.success("Organization created");

      const redirectPath =
        location?.state?.from?.pathname ||
        location?.state?.from ||
        "/";

      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create account";
      setErr(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Set up your organization</h2>
        <button
          onClick={onBack}
          className="text-sm text-neutral-400 hover:text-neutral-200"
          type="button"
        >
          Back
        </button>
      </div>

      <form
        className="mt-8 grid gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="grid gap-1">
          <span className="text-xs text-neutral-400">Work email</span>
          <input
            value={email}
            disabled
            className="h-11 disabled:cursor-not-allowed rounded-xl bg-neutral-950 border border-neutral-800 px-3 text-neutral-400"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs text-neutral-400">Organization name</span>
          <input
            type="text"
            value={org}
            onChange={(e) => setOrg(e.target.value)}
            className="h-11 rounded-xl bg-neutral-950 border border-neutral-700 px-3 outline-none"
            placeholder="Your company or team"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-xs text-neutral-400">Password</span>
          <div className="relative">
            <input
              type={showPwd ? "text" : "password"}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="h-11 w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 pr-10 outline-none"
              placeholder="Create a strong password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPwd((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-xs text-neutral-400 hover:text-neutral-200"
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          <PasswordHints pwd={pwd} />
        </label>

        {err && <p className="text-xs text-rose-400">{err}</p>}

        <button
          disabled={disabled}
          className="h-11 cursor-pointer disabled:cursor-not-allowed rounded-xl bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50 hover:bg-white focus:outline-none"
        >
          {loading ? "Creating..." : "Create organization"}
        </button>
      </form>
    </div>
  );
}
