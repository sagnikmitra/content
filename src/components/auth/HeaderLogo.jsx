import Logo from "@assets/logo.svg";

export default function HeaderLogo() {
  return (
    <div className="font-outfit">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-[#3c3c3c] bg-[#252526] px-4 py-3">
        <img className="size-9 rounded-xl" src={Logo} alt="Markex logo" />
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#d4d4d4]">
          Markex
        </span>
      </div>
      <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-normal md:text-4xl">
        Markex by ZS
      </h1>
    </div>
  );
}
