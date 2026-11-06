import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Button } from "./Buttons";
import { Sidebar } from "./Sidebar";
import Backdrop from "./Backdrop";
import ContentModal from "./ContentModal";
import ShareModal from "./ShareModal";
import ProfileMenu from "./ProfileMenu";
import { PlusIcon } from "../icons/PlusIcon";
import { ShareIcon } from "../icons/ShareIcon";
import { LibraryProvider, useLibrary } from "../lib/library";
import { scopeFromPath, type Scope } from "../lib/content";

export interface LayoutContext {
  sidebar: boolean;
  openShare: (scope: Scope) => void;
}

const EVERYTHING: Scope = { title: "ReMind", label: "Everything" };

function Shell() {
  const [sidebar, setSidebar] = useState(() => {
    try {
      return window.innerWidth >= 768 && localStorage.getItem("sidebar") === "open";
    } catch {
      return false;
    }
  });
  const toggleSidebar = () =>
    setSidebar((open) => {
      try {
        localStorage.setItem("sidebar", open ? "closed" : "open");
      } catch {
        
      }
      return !open;
    });

  const [showContentModal, setShowContentModal] = useState(false);
  const [shareScope, setShareScope] = useState<Scope | null>(null);

  const { refresh } = useLibrary();
  const { pathname } = useLocation();
  const scope = useMemo(() => scopeFromPath(pathname), [pathname]);

  useEffect(() => {
    if (window.innerWidth < 768) setSidebar(false);
  }, [pathname]);

  return (
    <div className="relative isolate min-h-dvh w-full">
      <Backdrop />

      <Sidebar expanded={sidebar} toggleSidebar={toggleSidebar} />

      {sidebar && (
        <button
          aria-label="Close sidebar"
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
        />
      )}

      <div
        className={`min-h-dvh min-w-0 p-3 transition-all duration-300 ease-in-out sm:p-5 ${
          sidebar ? "ml-16 sm:ml-20 md:ml-60" : "ml-16 sm:ml-20"
        }`}
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h1 className="hidden min-w-0 truncate pl-2 font-serif text-xl italic text-white drop-shadow-lg sm:block sm:text-2xl">
            {scope.title}
          </h1>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="scale-90 sm:scale-100">
              <Button
                variant="primary"
                size="sm"
                text="Add"
                startIcon={<PlusIcon />}
                onClick={() => setShowContentModal(true)}
              />
            </div>
            <div className="scale-90 sm:scale-100">
              <Button
                variant="secondary"
                size="sm"
                text="Share"
                startIcon={<ShareIcon />}
                onClick={() => setShareScope(scope.label === "ReMind" ? EVERYTHING : scope)}
              />
            </div>
            <ProfileMenu onShare={() => setShareScope(EVERYTHING)} />
          </div>
        </div>

        <Outlet context={{ sidebar, openShare: setShareScope } satisfies LayoutContext} />
      </div>

      {showContentModal && (
        <ContentModal onClose={() => setShowContentModal(false)} onCreated={refresh} />
      )}
      {shareScope && <ShareModal onClose={() => setShareScope(null)} scope={shareScope} />}
    </div>
  );
}

export default function AppLayout() {
  return (
    <LibraryProvider>
      <Shell />
    </LibraryProvider>
  );
}
