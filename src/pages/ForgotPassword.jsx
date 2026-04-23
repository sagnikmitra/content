import { requestPasswordReset, resetPassword } from "@api/auth";
import PasswordHints from "@components/auth/PasswordHints";
import { persistCredentials, setCredentials } from "@store/slices/profileSlice";
import { isValidEmail, strongPassword } from "@utils/auth/authUtils";
import { useState } from "react";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [issuedToken, setIssuedToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const passwordChecks = strongPassword(password);
  const isRequestDisabled = !isValidEmail(email) || loading;
  const isResetDisabled =
    !token.trim() || !passwordChecks.ok || password !== confirmPwd || loading;

  const handleRequest = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const response = await requestPasswordReset(email.trim());
      const receivedToken = response?.resetToken || "";
      setIssuedToken(receivedToken);
      setToken(receivedToken);
      toast.success(
        receivedToken
          ? "Reset token generated. Use it to set a new password."
          : "If an account exists, reset instructions were sent."
      );
      setStep("reset");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to request password reset"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setError(null);
    if (!token.trim()) {
      setError("Reset token is required");
      return;
    }
    if (!passwordChecks.ok) {
      setError("Password does not meet requirements");
      return;
    }
    if (password !== confirmPwd) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({
        token: token.trim(),
        password,
      });

      const authToken = response?.token || response?.accessToken;
      if (!authToken) {
        throw new Error(response?.message || "Failed to reset password");
      }

      const user = response?.user ?? response?.profile ?? null;

      dispatch(setCredentials({ token: authToken, user }));
      persistCredentials({ token: authToken, user });
      toast.success("Password updated. You're now signed in.");
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("request");
    setToken("");
    setIssuedToken("");
    setPassword("");
    setConfirmPwd("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#1a1b1b] text-neutral-100 flex items-center justify-center p-6 font-outfit">
      <div className="w-full max-w-md space-y-6">
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition"
        >
          <FiArrowLeft /> Back to sign in
        </Link>

        <div className="bg-[#131313] border border-neutral-800 rounded-2xl p-6 shadow-xl">
          {step === "request" && (
            <>
              <h1 className="text-xl font-semibold">Forgot password?</h1>
              <p className="mt-1 text-sm text-neutral-400">
                Enter your email and we&apos;ll help you reset your password.
              </p>

              <form
                className="mt-6 space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRequest();
                }}
              >
                <label className="grid gap-1">
                  <span className="text-xs text-neutral-400">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-xl bg-neutral-950 border border-neutral-700 px-3 outline-none"
                    placeholder="you@company.com"
                    autoFocus
                  />
                </label>

                {error && <p className="text-xs text-rose-400">{error}</p>}

                <button
                  type="submit"
                  disabled={isRequestDisabled}
                  className="h-11 w-full rounded-xl bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Set a new password</h1>
                <button
                  type="button"
                  className="text-xs text-neutral-400 hover:text-neutral-200"
                  onClick={resetForm}
                >
                  Start over
                </button>
              </div>
              <p className="mt-1 text-sm text-neutral-400">
                Paste the reset token you received and choose a new password.
              </p>

              {issuedToken && (
                <div className="mt-4 rounded-xl bg-neutral-900 border border-neutral-800 p-3">
                  <span className="text-xs text-neutral-500">
                    Reset token (copy &amp; keep private)
                  </span>
                  <code className="mt-1 block break-words text-xs text-neutral-200">
                    {issuedToken}
                  </code>
                </div>
              )}

              <form
                className="mt-6 space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReset();
                }}
              >
                <label className="grid gap-1">
                  <span className="text-xs text-neutral-400">Reset token</span>
                  <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="h-11 rounded-xl bg-neutral-950 border border-neutral-700 px-3 outline-none"
                    placeholder="Paste the token here"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-neutral-400">New password</span>
                  <div className="relative">
                    <input
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 w-full rounded-xl bg-neutral-950 border border-neutral-700 px-3 pr-10 outline-none"
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((prev) => !prev)}
                      className="absolute inset-y-0 right-3 flex items-center text-sm text-neutral-400 hover:text-neutral-200"
                    >
                      {showPwd ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <PasswordHints pwd={password} />
                </label>

                <label className="grid gap-1">
                  <span className="text-xs text-neutral-400">
                    Confirm password
                  </span>
                  <input
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    className="h-11 rounded-xl bg-neutral-950 border border-neutral-700 px-3 outline-none"
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </label>

                {error && <p className="text-xs text-rose-400">{error}</p>}

                <button
                  type="submit"
                  disabled={isResetDisabled}
                  className="h-11 w-full rounded-xl bg-neutral-100 text-neutral-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
                >
                  {loading ? "Updating..." : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
