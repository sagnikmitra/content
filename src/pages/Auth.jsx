import ExistingPassword from "@components/auth/ExistingPassword";
import FooterLinks from "@components/auth/FooterLinks";
import HeaderLogo from "@components/auth/HeaderLogo";
import {
  persistCredentials,
  setCredentials,
} from "@store/slices/profileSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AuthPage() {
  const defaultAdminIdentifier = import.meta.env.VITE_ADMIN_EMAIL || "";
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const userParam = params.get("user");

    if (!token) {
      return;
    }

    let user = null;
    if (userParam) {
      try {
        const decoded = window.atob(userParam);
        user = JSON.parse(decoded);
      } catch (error) {
        console.error("Failed to parse user payload:", error);
      }
    }

    dispatch(setCredentials({ token, user }));
    persistCredentials({ token, user });
    toast.success("Sign-in successful");

    params.delete("token");
    params.delete("user");
    const remaining = params.toString();
    const nextPath = remaining ? `${location.pathname}?${remaining}` : "/";

    navigate(nextPath, { replace: true });
  }, [dispatch, location.pathname, location.search, navigate]);

  return (
    <div className="app-shell auth-shell flex items-center justify-center py-6 md:py-10">
      <div className="w-full max-w-5xl rounded-[2rem] border border-[#3c3c3c] bg-[#1e1e1ecf] p-3 shadow-[0_32px_80px_-44px_rgba(0,0,0,0.95)] backdrop-blur-md md:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="auth-hero rounded-3xl p-6 md:p-9">
            <HeaderLogo />
            <p className="mt-5 max-w-xl text-sm leading-6 text-[#c7c7c7] md:text-base">
              Plan, write, and ship campaign content from one workspace.
              Markex keeps team timelines, drafts, and assets aligned.
            </p>
            <div className="mt-7 grid gap-3 text-sm text-[#d4d4d4]">
              <div className="auth-point">
                <span className="auth-point-dot" />
                Unified publishing calendar for all channels
              </div>
              <div className="auth-point">
                <span className="auth-point-dot" />
                Team-ready drafts with fast content handoff
              </div>
              <div className="auth-point">
                <span className="auth-point-dot" />
                Asset workflow tied directly to each post
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-5 md:p-7">
            <ExistingPassword
              defaultIdentifier={defaultAdminIdentifier}
              onBack={null}
              hideForgotPassword
            />
            <FooterLinks />
          </section>
        </div>
      </div>
    </div>
  );
}
