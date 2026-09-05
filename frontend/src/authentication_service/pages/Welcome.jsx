import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Quote } from "lucide-react";

function Welcome() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("hrms-theme") !== "light";
  });

  useEffect(() => {
    localStorage.setItem("hrms-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleGetStarted = () => {
    navigate("/login");
  };

  const features = [
    {
      title: "People Management",
      description: "Manage employee lifecycle effortlessly in one place.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20C3 16.7 5.7 14 9 14C12.3 14 15 16.7 15 20" />
          <path d="M16 5.5C18 6 19.5 7.6 19.5 9.5" />
          <path d="M17 14.5C19.3 15.2 21 17.3 21 20" />
        </svg>
      ),
    },
    {
      title: "Smart Analytics",
      description: "Data-driven insights for better decisions and planning.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 19L10 13L14 16L21 7" />
          <path d="M16 7H21V12" />
        </svg>
      ),
    },
    {
      title: "Attendance & Leave",
      description: "Automate attendance tracking and leave management.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M7 3V7" />
          <path d="M17 3V7" />
          <path d="M3 10H21" />
        </svg>
      ),
    },
    {
      title: "Secure & Compliant",
      description: "Enterprise-grade security with role-based access control.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 3L20 6V11C20 16.2 16.7 20.4 12 22C7.3 20.4 4 16.2 4 11V6L12 3Z" />
          <path d="M9 12L11 14L15 10" />
        </svg>
      ),
    },
    {
      title: "Process Automation",
      description: "Streamline HR workflows and save valuable time.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15A1.7 1.7 0 0 0 20 17.2L20.1 17.3L17.3 20.1L17.2 20A1.7 1.7 0 0 0 15 19.4A1.7 1.7 0 0 0 13.8 21H10.2A1.7 1.7 0 0 0 9 19.4A1.7 1.7 0 0 0 6.8 20L6.7 20.1L3.9 17.3L4 17.2A1.7 1.7 0 0 0 4.6 15A1.7 1.7 0 0 0 3 13.8V10.2A1.7 1.7 0 0 0 4.6 9A1.7 1.7 0 0 0 4 6.8L3.9 6.7L6.7 3.9L6.8 4A1.7 1.7 0 0 0 9 4.6A1.7 1.7 0 0 0 10.2 3H13.8A1.7 1.7 0 0 0 15 4.6A1.7 1.7 0 0 0 17.2 4L17.3 3.9L20.1 6.7L20 6.8A1.7 1.7 0 0 0 19.4 9A1.7 1.7 0 0 0 21 10.2V13.8A1.7 1.7 0 0 0 19.4 15Z" />
        </svg>
      ),
    },
    {
      title: "Real-time Notifications",
      description: "Stay updated with important alerts and announcements.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M18 8A6 6 0 0 0 6 8C6 15 3 15 3 17H21C21 15 18 15 18 8Z" />
          <path d="M10 21H14" />
        </svg>
      ),
    },
  ];

  return (
    <main
      className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${
        darkMode
          ? "bg-[#050711] text-white"
          : "bg-[#f5f7fb] text-slate-900"
      }`}
    >
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[54%_46%]">
        {/* =====================================================
            LEFT SIDE
        ===================================================== */}

        <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#050711] px-6 py-6 text-white sm:px-8 lg:px-10 xl:px-14 2xl:px-16">
          {/* Background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* Glow */}
            <div className="absolute -left-40 top-[15%] h-[360px] w-[360px] rounded-full bg-indigo-600/20 blur-[110px] animate-pulse" />

            <div className="absolute right-[10%] top-[-160px] h-[350px] w-[350px] rounded-full bg-blue-600/15 blur-[110px] animate-[float_10s_ease-in-out_infinite]" />

            <div className="absolute bottom-[-160px] right-[-80px] h-[350px] w-[350px] rounded-full bg-purple-600/20 blur-[110px] animate-[float_12s_ease-in-out_infinite_reverse]" />

            {/* Orbits */}
            <div className="absolute right-[5%] top-[4%] h-44 w-[430px] rounded-[50%] border border-indigo-400/15 rotate-[-18deg] animate-[orbit_10s_ease-in-out_infinite_alternate]" />

            <div className="absolute right-[10%] top-[10%] h-32 w-[330px] rounded-[50%] border border-blue-400/10 rotate-[30deg] animate-[orbit2_13s_ease-in-out_infinite_alternate]" />

            {/* Particles */}
            {Array.from({ length: 30 }).map((_, index) => (
              <span
                key={index}
                className="absolute h-[2px] w-[2px] rounded-full bg-indigo-400/60 animate-[particle_6s_ease-in-out_infinite]"
                style={{
                  left: `${(index * 37) % 100}%`,
                  top: `${(index * 61) % 100}%`,
                  animationDelay: `${index * -0.3}s`,
                }}
              />
            ))}

            {/* Bottom waves */}
            <div className="absolute -bottom-40 -left-24 h-56 w-[850px] rounded-[50%] border-t border-blue-500/30 rotate-[-7deg] shadow-[0_-20px_80px_rgba(72,75,255,0.12)] animate-[wave_9s_ease-in-out_infinite_alternate]" />

            <div className="absolute -bottom-48 left-10 h-56 w-[850px] rounded-[50%] border-t border-purple-500/25 rotate-[6deg] animate-[wave2_11s_ease-in-out_infinite_alternate]" />

            <div className="absolute -bottom-52 -left-48 h-56 w-[850px] rounded-[50%] border-t border-cyan-500/15 rotate-[-3deg]" />

            {/* Grid */}
            <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:55px_55px]" />
          </div>

          {/* Brand */}
          <header className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center text-indigo-400 sm:h-12 sm:w-12">
              <svg viewBox="0 0 64 64" fill="none">
                <circle
                  cx="32"
                  cy="18"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  d="M15 48C15 38.6 22.6 31 32 31C41.4 31 49 38.6 49 48"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M11 28C7 29 4.5 32.5 4.5 37"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M53 28C57 29 59.5 32.5 59.5 37"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                HRMS
              </h2>

              <p className="text-[9px] text-slate-400 sm:text-[11px]">
                Human Resource Management System
              </p>
            </div>
          </header>

          {/* Hero */}
          <div className="relative z-10 my-auto py-10 lg:py-8 xl:py-12">
            <p className="mb-3 text-[9px] font-bold tracking-[0.25em] text-blue-400 sm:text-[10px]">
              SMARTER WORKFORCE. STRONGER FUTURE.
            </p>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.06] tracking-[-0.04em] sm:text-5xl xl:text-[clamp(42px,4.2vw,62px)]">
              Empower{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                People.
              </span>
              <br />
              Elevate{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
                Performance.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-[15px]">
              A complete HR solution to manage your workforce, streamline
              processes and build a culture of success.
            </p>

            <div className="mt-5 h-[3px] w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />

            {/* Features */}
            <div className="mt-7 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 xl:mt-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group flex items-start gap-3"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/25 bg-indigo-500/[0.06] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-indigo-400/60 group-hover:bg-indigo-500/10 group-hover:shadow-[0_10px_30px_rgba(91,75,255,0.12)]">
                    <div className="h-6 w-6 text-indigo-400 [&>svg]:h-full [&>svg]:w-full [&>svg]:stroke-current [&>svg]:stroke-[1.6] [&>svg]:stroke-linecap-round [&>svg]:stroke-linejoin-round">
                      {feature.icon}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-[12px] font-bold text-white sm:text-[13px]">
                      {feature.title}
                    </h3>

                    <p className="mt-1 max-w-[250px] text-[10px] leading-5 text-slate-400 sm:text-[11px]">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="relative z-10 border-t border-white/[0.08] pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-500/25 bg-indigo-500/[0.06] text-indigo-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 stroke-current stroke-[1.5]"
                >
                  <path d="M4 21V5C4 4.4 4.4 4 5 4H15C15.6 4 16 4.4 16 5V21" />
                  <path d="M16 9H20V21" />
                  <path d="M8 8H11" />
                  <path d="M8 12H11" />
                  <path d="M8 16H11" />
                  <path d="M19 13H20" />
                  <path d="M19 17H20" />
                </svg>
              </div>

              <div>
                <h3 className="text-sm font-bold">
                  Mediatize Tech Pvt Ltd
                </h3>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Innovating HR. Empowering People.
                </p>
              </div>
            </div>

            <p className="mt-3 text-[9px] text-slate-600">
              © 2026 Mediatize Tech Pvt Ltd. All rights reserved.
            </p>
          </div>
        </section>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}

        <section
          className={`relative flex min-h-screen flex-col overflow-hidden px-6 py-6 sm:px-10 lg:px-10 xl:px-16 ${
            darkMode ? "bg-[#0c0e1b]" : "bg-white"
          }`}
        >
          {/* Light mode decorative background */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className={`absolute right-[-180px] top-[20%] h-[400px] w-[400px] rounded-full blur-[120px] ${
                darkMode ? "bg-indigo-600/[0.04]" : "bg-indigo-500/[0.07]"
              }`}
            />

            <div
              className={`absolute bottom-[-180px] right-[-100px] h-[400px] w-[400px] rounded-full blur-[120px] ${
                darkMode ? "bg-purple-600/[0.04]" : "bg-purple-500/[0.06]"
              }`}
            />

            {!darkMode && (
              <div className="absolute bottom-0 right-0 h-[320px] w-[420px] opacity-[0.25] [background-image:radial-gradient(#7668ff_1px,transparent_1px)] [background-size:12px_12px] [mask-image:linear-gradient(to_top_left,black,transparent)]" />
            )}
          </div>

          {/* Theme */}
          <div className="relative z-10 flex justify-end">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span
                className={`flex items-center gap-1 ${
                  darkMode ? "font-bold text-current" : ""
                }`}
              >
                <Moon size={14} />
                Dark
              </span>

              <button
                onClick={() => setDarkMode((value) => !value)}
                className={`relative h-7 w-12 rounded-full border transition-all duration-300 ${
                  darkMode
                    ? "border-slate-600 bg-slate-900"
                    : "border-slate-300 bg-slate-100"
                }`}
                aria-label="Toggle dark and light mode"
              >
                <span
                  className={`absolute top-[3px] h-[19px] w-[19px] rounded-full shadow-md transition-all duration-300 ${
                    darkMode
                      ? "left-[25px] bg-white"
                      : "left-[3px] bg-slate-800"
                  }`}
                />
              </button>

              <span
                className={`flex items-center gap-1 ${
                  !darkMode ? "font-bold text-current" : ""
                }`}
              >
                <Sun size={14} />
                Light
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="relative z-10 flex flex-1 flex-col items-center">
            <div className="mt-16 text-center sm:mt-20 lg:mt-[8vh]">
              {/* Icon */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-indigo-500/15 to-blue-500/10 shadow-[0_20px_50px_rgba(74,85,255,0.08)] sm:h-24 sm:w-24">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  className="h-12 w-12 stroke-indigo-500 stroke-[3]"
                >
                  <circle cx="32" cy="18" r="9" />
                  <path d="M15 48C15 38.6 22.6 31 32 31C41.4 31 49 38.6 49 48" />
                  <path d="M11 28C7 29 4.5 32.5 4.5 37" />
                  <path d="M53 28C57 29 59.5 32.5 59.5 37" />
                </svg>
              </div>

              <h2 className="mt-6 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                  HRMS
                </span>
              </h2>

              <p className="mt-3 text-xs leading-6 text-slate-400 sm:text-sm">
                Your workspace for better management
                <br />
                and stronger teams.
              </p>
            </div>

            {/* Button */}
            <button
              onClick={handleGetStarted}
              className="group mt-8 flex w-full max-w-[500px] items-center gap-4 rounded-[17px] bg-gradient-to-r from-[#6748f5] to-[#367ef1] px-5 py-5 text-left text-white shadow-[0_20px_45px_rgba(76,71,240,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_27px_55px_rgba(76,71,240,0.32)] active:translate-y-0 sm:mt-10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-7 w-7 stroke-current stroke-[1.8]"
                >
                  <path d="M10 17L15 12L10 7" />
                  <path d="M15 12H3" />
                  <path d="M21 4V20" />
                </svg>
              </div>

              <div className="flex flex-1 flex-col">
                <strong className="text-base font-bold sm:text-lg">
                  Get Started
                </strong>

                <span className="mt-0.5 text-[10px] opacity-80 sm:text-xs">
                  Sign in to your account
                </span>
              </div>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 shrink-0 stroke-current stroke-[1.7] transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12H19" />
                <path d="M13 6L19 12L13 18" />
              </svg>
            </button>

            {/* Security */}
            <div className="mt-6 flex w-full max-w-[500px] items-center gap-3">
              <span className="h-px flex-1 bg-current opacity-10" />

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 stroke-current stroke-[1.6]"
                >
                  <path d="M12 3L20 6V11C20 16.2 16.7 20.4 12 22C7.3 20.4 4 16.2 4 11V6L12 3Z" />
                  <path d="M9 12L11 14L15 10" />
                </svg>

                Secure access to your workplace
              </div>

              <span className="h-px flex-1 bg-current opacity-10" />
            </div>

            {/* Quote */}
            <div
              className={`mt-14 w-full max-w-[500px] rounded-[18px] border px-5 py-7 text-center ${
                darkMode
                  ? "border-white/[0.08] bg-white/[0.02]"
                  : "border-slate-200/80 bg-slate-50/70"
              }`}
            >
              <Quote size={28} className="mx-auto text-indigo-500" />

              <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                Great companies are built
                <br />
                on great teams.
              </p>

              <div className="mx-auto mt-4 h-[3px] w-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" />
            </div>
          </div>

          {/* Footer */}
          <footer className="relative z-10 pb-1 pt-8 text-center text-[9px] text-slate-500">
            © 2026 Mediatize Tech Pvt Ltd. All rights reserved.
          </footer>
        </section>
      </div>
    </main>
  );
}

export default Welcome;