import ExistingPassword from "@components/auth/ExistingPassword";
import HeaderLogo from "@components/auth/HeaderLogo";
import {
  persistCredentials,
  setCredentials,
} from "@store/slices/profileSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function AuthPage() {
  const defaultAdminIdentifier =
    import.meta.env.VITE_ADMIN_EMAIL || "admin@adm.in";
  const [step] = useState({
    name: "existing_password",
    identifier: defaultAdminIdentifier,
  });
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
    <div className="app-shell flex items-center justify-center">
      <div className="w-full max-w-md">
        <HeaderLogo />
        <div className="mt-8 glass-panel rounded-2xl p-6">
          {step.name === "existing_password" && (
            <ExistingPassword
              identifier={step.identifier || step.email}
              onBack={null}
              hideForgotPassword
            />
          )}
        </div>
      </div>
    </div>
  );
}
