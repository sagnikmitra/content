import { checkEmailStatus } from "@api/auth";
import {
  isGenericDomain,
  isValidEmail,
  isValidUsername,
} from "@utils/auth/authUtils";
import { useState } from "react";

export default function Landing({ onResolved }) {
  const [identifier, setIdentifier] = useState("");
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const normalizedIdentifier = identifier.trim();
  const disabled =
    (!isValidEmail(normalizedIdentifier) &&
      !isValidUsername(normalizedIdentifier)) ||
    loading;

  const handleContinue = async () => {
    const normalized = identifier.trim();
    setErr(null);
    if (!isValidEmail(normalized) && !isValidUsername(normalized)) {
      setErr("Enter a valid email or username");
      return;
    }
    setLoading(true);

    try {
      const data = await checkEmailStatus(normalized);
      const exists =
        data?.exists ?? data?.userExists ?? data?.hasAccount ?? false;

      if (exists) {
        onResolved({ name: "existing_password", identifier: normalized });
        return;
      }

      if (!isValidEmail(normalized)) {
        setErr("Use email for sign-up. Username supports login only.");
        return;
      }

      const suggestedFlow =
        data?.nextStep ||
        data?.flow ||
        data?.type ||
        (isGenericDomain(normalized) ? "signup_generic" : "signup_org");

      const nextStep = ["signup_generic", "signup_org"].includes(suggestedFlow)
        ? suggestedFlow
        : suggestedFlow === "generic"
          ? "signup_generic"
          : suggestedFlow === "org"
            ? "signup_org"
            : isGenericDomain(normalized)
              ? "signup_generic"
              : "signup_org";

      onResolved({ name: nextStep, email: normalized });
    } catch (e) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-outfit">
      <h2 className="text-lg font-semibold">Welcome</h2>
      <p className="mt-1 text-sm text-neutral-400">
        Use email or username to continue
      </p>

      <div className="mt-[3rem] grid gap-4">
        <form
          className="grid gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
        >
          <label className="grid gap-1">
            <span className="text-xs text-neutral-400">Email or Username</span>
            <input
              type="text"
              autoFocus
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="h-11 rounded-xl bg-neutral-950 border border-neutral-700 px-3 outline-none"
              placeholder="you@example.com or admin"
            />
          </label>

          {err && <p className="text-xs text-rose-400">{err}</p>}

          <button
            disabled={disabled}
            className="h-11 cursor-pointer disabled:cursor-not-allowed rounded-xl bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50  hover:bg-white focus:outline-none "
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
