import type { ReactNode } from "react";
import { Panel, PageColumn } from "../components/Panel";
import { TYPE_LABELS } from "../lib/content";
import { useAiTypes } from "../lib/useAiTypes";

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <details className="group border-b border-gray-100 py-3 last:border-0">
      <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">
        <span className="mr-2 inline-block text-gray-400 transition-transform group-open:rotate-90">›</span>
        {q}
      </summary>
      <div className="mt-2 pl-5 text-sm leading-6 text-gray-600">{children}</div>
    </details>
  );
}

export default function Help() {
  const { types } = useAiTypes();

  return (
    <PageColumn>
      <Panel title="Getting started">
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-6 text-gray-700">
          <li>Click <b>Add</b>, paste a link (YouTube, X/Twitter, article, PDF, GitHub…) or upload a PDF / Markdown / text file.</li>
          <li>Give it a title, and optionally tags (comma separated) and a description.</li>
          <li>Find it again from the sidebar — <b>Tweets</b>, <b>Videos</b>, <b>Documents</b>, <b>Links</b> — or by <b>Tags</b> and the search box.</li>
          <li>Press the sparkle icon on a card to <b>Ask AI</b> questions about that item once it's ready.</li>
          <li>Use <b>Share</b> to create a read-only link to your whole brain or just the section you're viewing.</li>
        </ol>
      </Panel>

      <Panel title="What can I save?">
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Saved</th>
                <th className="px-4 py-2 font-medium">Ask AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(TYPE_LABELS).map(([type, label]) => (
                <tr key={type}>
                  <td className="px-4 py-2">{label}</td>
                  <td className="px-4 py-2 text-green-600">✓</td>
                  <td className="px-4 py-2">{types.has(type) ? <span className="text-green-600">✓</span> : <span className="text-gray-400">Not yet</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Questions">
        <Faq q="What do the little dots on a card mean?">
          Grey means queued, yellow means the AI service is reading and indexing it, and red means processing failed. No dot means it's ready (or it's a bookmark-only type).
        </Faq>
        <Faq q="Ask AI says my content isn't ready">
          Indexing can take a minute for long videos or PDFs. Watch the dot on the card; once it disappears you can ask questions. If it turns red, delete the item and add it again.
        </Faq>
        <Faq q="Who can see a share link?">
          Anyone who has the link can view titles, links, descriptions and tags of the shared items — but can't edit, delete or see your email. Links expire after 30 days. Only share them with people you trust.
        </Faq>
        <Faq q="How do tags work?">
          Separate tags with commas (<span className="font-mono">ai, reading list</span>). Each one gets a page under <b>Tags</b>, and you can share a single tag from there.
        </Faq>
        <Faq q="Ask AI isn't responding">
          The AI service may be offline. Open <b>Settings</b> to see its connection status.
        </Faq>
      </Panel>
    </PageColumn>
  );
}
