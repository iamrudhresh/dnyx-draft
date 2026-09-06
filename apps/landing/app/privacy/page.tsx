import { ArrowLeft, CheckCircle2, Database, EyeOff, Lock, ServerOff, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type React from 'react';
import { Footer } from '../../components/Footer';
import { Navbar } from '../../components/Navbar';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-slate-500">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} &bull; Dnyx Tech (Dnyx Group)
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 mb-10 flex items-start gap-4">
          <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
            <strong className="block font-bold mb-1">Our Core Privacy Commitment: Local-First &amp; Zero-Telemetry</strong>
            Dnyx Draft operates on a 100% local-first model. We do not collect, transmit, store, or sell your documents, keystrokes, personal information, or analytics. Your notes remain strictly on your physical device.
          </div>
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Information We Do NOT Collect</h2>
            <p>
              Unlike traditional cloud-based note editors, Dnyx Draft does not operate a user tracking backend. Specifically:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>No Document Content:</strong> Keystrokes, titles, and attachments are processed purely in client-side memory.</li>
              <li><strong>No Account Credentials:</strong> No email addresses, usernames, or passwords are ever requested or stored on any server.</li>
              <li><strong>No Telemetry or Tracking Cookies:</strong> We do not use third-party analytics trackers, advertising beacons, or session recording tools.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Local Browser Storage (IndexedDB)</h2>
            <p>
              Your documents, folders, custom templates, and editor preferences are persisted locally inside your web browser’s sandboxed <code>IndexedDB</code> database via Dexie.js. This data never leaves your computer unless you explicitly download, export, or share a snapshot link.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. Zero-Knowledge Document Encryption</h2>
            <p>
              When utilizing the Password Lock Vault feature, encryption is performed entirely in your browser using the native WebCrypto API (PBKDF2 with 100,000 rounds and AES-256-GCM). The password and unencrypted plaintext never touch unencrypted storage, and Dnyx Tech has no mathematical capability to recover locked content without your password.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Snapshot Sharing</h2>
            <p>
              If you choose to use the optional &quot;Share Snapshot&quot; feature, a temporary static copy of the specific document you selected is generated for your public URL. Shared snapshots are read-only and can be expired at any time.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Contact &amp; Governance</h2>
            <p>
              For inquiries regarding privacy, compliance, or open-source licensing, please contact:
            </p>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">Dnyx Tech</div>
              <div className="text-slate-500">A Division of Dnyx Business Solutions Private Limited</div>
              <div className="text-slate-500">Dnyx Group Corporate Governance</div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
