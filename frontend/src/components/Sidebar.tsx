import type { ReactNode } from "react"
import { Link, NavLink } from "react-router-dom"
import { Logo } from "../icons/Logo"
import { TweetIcon } from "../icons/TweetIcon"
import { YoutubeIcon } from "../icons/YoutubeIcon"
import { DocIcon } from "../icons/DocIcon"
import { LinkIcon } from "../icons/LinkIcon"
import { LeftArrow } from "../icons/LeftArrow"
import { RightArrow } from "../icons/RightArrow"
import { Hashtag } from "../icons/Hashtag"
import { Setting } from "../icons/Setting"
import { Help } from "../icons/Help"
import { HomeIcon } from "../icons/HomeIcon"

interface SidebarProps {
    expanded: boolean;
    toggleSidebar: () => void;
    interactive?: boolean;
}

interface NavItemProps {
    to: string;
    label: string;
    expanded: boolean;
    interactive: boolean;
    icon: (active: boolean) => ReactNode;
}

function NavItem({ to, label, expanded, interactive, icon }: NavItemProps) {
    const row = (active: boolean) => (
        <>
            {active && <span className="absolute -left-2 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-cyan-300" />}
            <span className="flex size-7 shrink-0 items-center justify-center">{icon(active)}</span>
            {expanded && <span className={`truncate ${active ? "font-medium" : ""}`}>{label}</span>}
        </>
    );

    const base = `relative flex items-center gap-4 rounded-xl px-3 py-2.5 ${expanded ? "" : "justify-center"}`;

    if (!interactive) {
        return <li><div className={base}>{row(false)}</div></li>;
    }

    return (
        <li>
            <NavLink
                to={to}
                title={label}
                className={({ isActive }) =>
                    `${base} transition-colors ${isActive ? "bg-white/10 text-cyan-300" : "hover:bg-white/10 hover:text-cyan-300"}`
                }
            >
                {({ isActive }) => row(isActive)}
            </NavLink>
        </li>
    );
}

export function Sidebar({ expanded, toggleSidebar, interactive = true }: SidebarProps) {
    return (
        <aside
            className={`fixed left-0 top-0 z-40 flex h-dvh flex-col border-r border-amber-50 backdrop-blur-xs transition-all duration-300 ease-in-out ${
                expanded ? "w-60 text-white max-md:bg-slate-900/90 max-md:backdrop-blur-md" : "w-16 text-white sm:w-20"
            }`}
        >
            <div className={`flex shrink-0 items-center ${expanded ? "justify-between px-4 pt-4 pb-2" : "flex-col gap-2 pt-4 pb-2"}`}>
                <div className="flex min-w-0 items-center gap-2">
                    {interactive ? (
                        <Link to="/home" title="ReMind home" className="shrink-0 rounded-xl max-md:bg-white/85">
                            <Logo className={expanded ? "size-11" : "size-10 sm:size-12"} />
                        </Link>
                    ) : (
                        <Logo className={expanded ? "size-11" : "size-10 sm:size-12"} />
                    )}
                    {expanded && (
                        <span className="truncate font-serif text-2xl font-medium italic">ReMind</span>
                    )}
                </div>

                {interactive && (
                    <button
                        onClick={toggleSidebar}
                        aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
                        title={expanded ? "Collapse sidebar" : "Expand sidebar"}
                        className="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/15 hover:text-cyan-300"
                    >
                        {expanded ? <LeftArrow /> : <RightArrow />}
                    </button>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 pt-2 sm:px-3">
                <ul className="space-y-1 text-stone-200">
                    <NavItem to="/home" label="All" expanded={expanded} interactive={interactive}
                        icon={(a) => <span><HomeIcon className="size-6 transition-all duration-200 ease-in-out hover:size-7" /></span>} />
                    <NavItem to="/tweets" label="Tweets" expanded={expanded} interactive={interactive}
                        icon={() => <TweetIcon />} />
                    <NavItem to="/videos" label="Videos" expanded={expanded} interactive={interactive}
                        icon={() => <YoutubeIcon />} />
                    <NavItem to="/documents" label="Documents" expanded={expanded} interactive={interactive}
                        icon={(a) => <span><DocIcon /></span>} />
                    <NavItem to="/links" label="Links" expanded={expanded} interactive={interactive}
                        icon={(a) => <span><LinkIcon /></span>} />
                    <NavItem to="/tags" label="Tags" expanded={expanded} interactive={interactive}
                        icon={(a) => <span><Hashtag /></span>} />
                </ul>

                <ul className="mt-4 space-y-1 border-t border-amber-50/60 pt-4 text-stone-300">
                    <NavItem to="/settings" label="Settings" expanded={expanded} interactive={interactive}
                        icon={() => <Setting />} />
                    <NavItem to="/help" label="Help" expanded={expanded} interactive={interactive}
                        icon={() => <Help />} />
                </ul>
            </nav>
        </aside>
    )
}
