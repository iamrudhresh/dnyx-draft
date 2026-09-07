'use client';

import { GitBranch, Link2, MessageSquare, Users } from 'lucide-react';
import type React from 'react';
import { Section, SectionHeader } from './ui/Section';
import { APP_URL, README_BUILDER_URL } from '@/lib/constants';

export const ToolsSpotlight: React.FC = () => {
  return (
    <Section id="collaborate" tone="muted">
      <SectionHeader
        align="center"
        title="Share, collaborate & ship docs faster"
        description="Two purpose-built tools that go beyond a single-player editor — real-time collaboration and a dedicated README generator, both running on the same local-first engine."
      />

      <div className="divide-y divide-border border-y border-border">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-10 py-8">
          <div className="flex items-center gap-3 md:w-56 shrink-0">
            <Users className="h-6 w-6 text-primary shrink-0" />
            <span className="text-lg font-medium text-foreground">Live Share</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Real-time collaborative editing, no server account needed
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-2xl">
              Invite collaborators with a link and assign host, editor, or viewer roles. Content syncs
              every two seconds, so your team can review and edit the same document together — then it
              goes back to living entirely on your device.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
              {['Host / editor / viewer roles', 'Shareable invite links', '2-second content sync', 'Threaded, anchored comments'].map(
                (line) => (
                  <div key={line} className="flex items-center gap-2 text-xs text-foreground font-medium">
                    <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{line}</span>
                  </div>
                ),
              )}
            </div>
            <a href={APP_URL} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
              Start a Live Share session
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 md:gap-10 py-8">
          <div className="flex items-center gap-3 md:w-56 shrink-0">
            <GitBranch className="h-6 w-6 text-primary shrink-0" />
            <span className="text-lg font-medium text-foreground">README Builder</span>
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              A guided wizard that writes your project&apos;s README for you
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-2xl">
              Point it at a public or private GitHub repo — using an encrypted personal access token
              vault — and build a polished README section by section: badges, tech stack, install steps,
              folder structure, API reference, FAQ, and more.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
              {['Pulls live metadata from GitHub', '15 optional sections & badges', 'Encrypted PAT vault (up to 50 tokens)', 'Exports clean, ready-to-commit Markdown'].map(
                (line) => (
                  <div key={line} className="flex items-center gap-2 text-xs text-foreground font-medium">
                    <Link2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{line}</span>
                  </div>
                ),
              )}
            </div>
            <a
              href={README_BUILDER_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Try the README Builder
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
};
