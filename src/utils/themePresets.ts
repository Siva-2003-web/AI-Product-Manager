export type ThemeStyle = "Industrial" | "Minimalist" | "Playful";

export interface BentoStyles {
  // Main background of the dashboard view
  bgClass: string;
  // Primary big bento card (e.g., live session)
  primaryCard: string;
  // Summary side/stat card
  statCard: string;
  // Active maximized tab component container
  maximizedContainer: string;
  // Input fields in the bento or setup
  inputField: string;
  // Primary buttons
  buttonPrimary: string;
  // Pill indicators / tags
  badgeTag: string;
  // Tab buttons
  tabButton: (isActive: boolean) => string;
}

export const THEME_PRESETS: Record<ThemeStyle, BentoStyles> = {
  Industrial: {
    bgClass: "bg-slate-100",
    primaryCard: "bg-white border-2 border-slate-900 rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-between transition-all duration-300",
    statCard: "bg-indigo-600 border-2 border-slate-900 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] text-white flex flex-col justify-between transition-all duration-300",
    maximizedContainer: "bg-white border-2 border-slate-900 rounded-2xl p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] min-h-[420px] transition-all duration-300",
    inputField: "w-full text-slate-900 bg-white border-2 border-slate-900 rounded-xl p-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-indigo-600 transition-all font-mono",
    buttonPrimary: "w-full flex items-center justify-center gap-2 text-white bg-slate-900 hover:bg-slate-800 border-2 border-slate-900 font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(15,23,42,0.15)] cursor-pointer",
    badgeTag: "px-2 py-0.5 bg-slate-100 border border-slate-300 text-slate-800 text-[10px] font-mono rounded font-medium uppercase tracking-wider",
    tabButton: (isActive: boolean) => 
      `px-4 py-2.5 rounded-xl border-2 font-black text-xs font-mono transition-all flex items-center gap-2 cursor-pointer ${
        isActive
          ? "bg-indigo-600 text-white border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] translate-x-[-1px] translate-y-[-1px]"
          : "bg-white text-slate-600 border-slate-900 shadow-none hover:bg-slate-50 hover:text-slate-950"
      }`
  },
  Minimalist: {
    bgClass: "bg-neutral-50/60",
    primaryCard: "bg-white border border-neutral-200/80 rounded-xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md",
    statCard: "bg-slate-900 border border-neutral-800 rounded-xl p-6 shadow-sm text-neutral-100 flex flex-col justify-between transition-all duration-300",
    maximizedContainer: "bg-white border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-sm min-h-[420px] transition-all duration-300",
    inputField: "w-full text-slate-900 bg-neutral-50/50 border border-neutral-200 rounded-lg p-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all font-sans",
    buttonPrimary: "w-full flex items-center justify-center gap-2 text-white bg-slate-950 hover:bg-slate-900 font-medium text-sm px-6 py-3 rounded-lg transition-all shadow-xs cursor-pointer",
    badgeTag: "px-2 py-0.5 bg-neutral-50 border border-neutral-200 text-neutral-600 text-[10px] font-sans rounded-md font-medium tracking-normal",
    tabButton: (isActive: boolean) => 
      `px-4 py-2 border-b-2 font-semibold text-xs font-sans transition-all flex items-center gap-2 cursor-pointer ${
        isActive
          ? "border-neutral-900 text-neutral-900 bg-neutral-100/50"
          : "border-transparent text-neutral-450 hover:text-neutral-800"
      }`
  },
  Playful: {
    bgClass: "bg-purple-50/40",
    primaryCard: "bg-white border-2 border-purple-200 rounded-3xl p-6 shadow-[0_8px_30px_rgb(237,233,254,0.5)] flex flex-col justify-between transition-all duration-300 hover:scale-[1.01] hover:border-purple-300",
    statCard: "bg-gradient-to-tr from-purple-600 to-indigo-500 border-2 border-purple-300 rounded-3xl p-6 shadow-[0_8px_30px_rgb(99,102,241,0.25)] text-white flex flex-col justify-between transition-all duration-300",
    maximizedContainer: "bg-white border-2 border-purple-200 rounded-3xl p-6 md:p-8 shadow-[0_8px_40px_rgb(237,233,254,0.4)] min-h-[420px] transition-all duration-300",
    inputField: "w-full text-slate-900 bg-white border-2 border-purple-100 rounded-2xl p-4 text-sm placeholder:text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-450/20 focus:border-purple-400 transition-all font-sans",
    buttonPrimary: "w-full flex items-center justify-center gap-2 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 font-black text-sm px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-purple-500/25 cursor-pointer dynamic-bounce",
    badgeTag: "px-2.5 py-1 bg-purple-50 border border-purple-150 text-purple-600 text-[10px] font-sans rounded-full font-bold tracking-normal",
    tabButton: (isActive: boolean) => 
      `px-4 py-2.5 rounded-full border-2 font-extrabold text-xs font-sans transition-all flex items-center gap-2 cursor-pointer ${
        isActive
          ? "bg-purple-600 text-white border-purple-600 shadow-[0_4px_12px_rgba(147,51,234,0.2)]"
          : "bg-white text-purple-600 border-purple-100 hover:bg-purple-50/50 hover:border-purple-200"
      }`
  }
};
