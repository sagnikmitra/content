import { Link } from "react-router-dom";

export default function FooterLinks() {
  return (
    <div className="mt-4 text-center text-xs text-neutral-500">
      <span>By continuing you agree to our </span>
      <Link
        to="/terms"
        className="underline-offset-2 underline hover:text-neutral-300"
      >
        Terms
      </Link>
      <span> and </span>
      <Link
        to="/privacy"
        className="underline-offset-2 underline hover:text-neutral-300"
      >
        Privacy Policy
      </Link>
      <div className="mt-2">© {new Date().getFullYear()} Content Tracker</div>
    </div>
  );
}
