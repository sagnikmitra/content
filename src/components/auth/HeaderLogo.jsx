import Logo from "@assets/logo.svg";

export default function HeaderLogo() {
  return (
    <div className="flex items-center gap-3 font-outfit mb-4">
      <img className="size-10 rounded-2xl" src={Logo} alt="Logo" />
      <h1 className="text-3xl font-semibold tracking-normal">
        Track, Organize & Grow !
      </h1>
    </div>
  );
}
