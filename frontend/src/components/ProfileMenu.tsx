import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../lib/api";
import { useLibrary } from "../lib/library";
import { UserIcon } from "../icons/UserIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { LogoutIcon } from "../icons/LogoutIcon";
import { ChevronDown } from "../icons/ChevronDown";
import { Setting } from "../icons/Setting";
import { Help } from "../icons/Help";

interface ProfileMenuProps {
  onShare: () => void;
}

export default function ProfileMenu({ onShare }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, items } = useLibrary();

  const name = user?.username || user?.email?.split("@")[0] || "Account";
  const initial = (user?.username || user?.email || "?").trim().charAt(0).toUpperCase() || "?";
  const ready = items.filter((i) => i.status === "DONE").length;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    signOut();
    navigate("/", { replace: true });
  };

  const itemClass =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-100";

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={name}
        className="flex items-center gap-1 rounded-full bg-white/10 p-1 pr-2 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-medium text-white shadow-md">
          {initial}
        </span>
        <span className="hidden max-w-28 truncate text-sm md:block">{name}</span>
        <ChevronDown className={`size-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-[100] mt-2 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-gray-100 bg-white text-black shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-600 text-lg font-medium text-white">
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user?.username || name}</p>
              <p className="truncate text-xs text-gray-500">{user?.email || "Email unavailable"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-b border-gray-100 p-3 text-center">
            <div className="rounded-lg bg-gray-50 py-2">
              <p className="text-lg font-semibold">{items.length}</p>
              <p className="text-[11px] text-gray-500">Saved items</p>
            </div>
            <div className="rounded-lg bg-gray-50 py-2">
              <p className="text-lg font-semibold">{ready}</p>
              <p className="text-[11px] text-gray-500">AI-ready</p>
            </div>
          </div>

          <div className="p-2">
            <button role="menuitem" className={itemClass} onClick={() => go("/profile")}>
              <UserIcon className="size-5 text-gray-500" /> Profile
            </button>
            <button
              role="menuitem"
              className={itemClass}
              onClick={() => {
                setOpen(false);
                onShare();
              }}
            >
              <span className="text-gray-500"><ShareIcon /></span> Share my brain
            </button>
            <button role="menuitem" className={itemClass} onClick={() => go("/settings")}>
              <span className="size-5 text-gray-500 [&_svg]:size-5 [&_svg]:hover:size-5"><Setting /></span> Settings
            </button>
            <button role="menuitem" className={itemClass} onClick={() => go("/help")}>
              <span className="size-5 text-gray-500 [&_svg]:size-5 [&_svg]:hover:size-5"><Help /></span> Help
            </button>
          </div>

          <div className="border-t border-gray-100 p-2">
            <button
              role="menuitem"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogoutIcon className="size-5" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
