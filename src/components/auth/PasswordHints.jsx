import { strongPassword } from "@utils/auth/authUtils";
import { useMemo } from "react";

export default function PasswordHints({ pwd }) {
  const checks = useMemo(() => strongPassword(pwd), [pwd]);
  const Item = ({ ok, label }) => (
    <div className="flex items-center gap-2">
      <div
        className={`size-2 rounded-full ${
          ok ? "bg-emerald-400" : "bg-neutral-700"
        }`}
      />
      <span
        className={`text-xs ${ok ? "text-neutral-300" : "text-neutral-500"}`}
      >
        {label}
      </span>
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
      <Item ok={checks.min} label="12+ characters" />
      <Item ok={checks.digit} label="1+ digit" />
      <Item ok={checks.upper} label="1+ uppercase" />
      <Item ok={checks.lower} label="1+ lowercase" />
      <Item ok={checks.special} label="1+ special" />
    </div>
  );
}
