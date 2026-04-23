import Logo from "@assets/logo.svg";

export default function HeaderLogo() {
  return (
    <div className="font-outfit">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-[#7fb1ff40] bg-[#0c1a30b3] px-4 py-3">
        <img className="size-9 rounded-xl" src={Logo} alt="ContentOS logo" />
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#89c7ff]">
          ContentOS
        </span>
      </div>
      <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-normal md:text-4xl">
        ContentOS by sgnk
      </h1>
    </div>
  );
}
