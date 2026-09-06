'use client';

import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCopy,
  Eye,
  EyeOff,
  FileDown,
  FolderOpen,
  Key,
  Loader2,
  Printer,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { GithubIcon } from '@/components/icons/GithubIcon';
import { MarkdownPreview } from '@/components/preview/MarkdownPreview';
import { Button } from '@/components/ui/button';
import { addToken, getToken, listTokens } from '@/lib/crypto/pat-vault';
import { useWorkspaceStore } from '@/lib/store/useWorkspaceStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_DEFS = [
  { id: 'title', label: 'Project Title', icon: '📌', defaultOn: true },
  { id: 'description', label: 'Description', icon: '📋', defaultOn: true },
  { id: 'features', label: 'Features', icon: '✨', defaultOn: true },
  { id: 'techstack', label: 'Tech Stack', icon: '🛠️', defaultOn: true },
  { id: 'installation', label: 'Installation & Usage', icon: '🚀', defaultOn: true },
  { id: 'structure', label: 'Folder Structure', icon: '📁', defaultOn: false },
  { id: 'screenshots', label: 'Screenshots & Demo', icon: '🖼️', defaultOn: false },
  { id: 'api', label: 'API Reference', icon: '⚡', defaultOn: false },
  { id: 'contributing', label: 'Contributing', icon: '🤝', defaultOn: true },
  { id: 'author', label: 'License & Author', icon: '👤', defaultOn: true },
  { id: 'roadmap', label: 'Roadmap', icon: '🗺️', defaultOn: false },
  { id: 'faq', label: 'FAQ', icon: '❓', defaultOn: false },
  { id: 'ack', label: 'Acknowledgements', icon: '🙏', defaultOn: false },
  { id: 'support', label: 'Support & Donation', icon: '❤️', defaultOn: false },
  { id: 'academic', label: 'Academic / Research', icon: '📚', defaultOn: false },
] as const;

const TECHS: Array<{ label: string; emoji: string }> = [
  { label: 'Python', emoji: '🐍' },
  { label: 'JavaScript', emoji: '🟨' },
  { label: 'TypeScript', emoji: '💙' },
  { label: 'React', emoji: '⚛️' },
  { label: 'Next.js', emoji: '▲' },
  { label: 'Vue', emoji: '💚' },
  { label: 'Node.js', emoji: '🟢' },
  { label: 'Express', emoji: '🚂' },
  { label: 'Django', emoji: '🎸' },
  { label: 'FastAPI', emoji: '⚡' },
  { label: 'Flask', emoji: '🌶️' },
  { label: 'Spring', emoji: '🍃' },
  { label: 'Java', emoji: '☕' },
  { label: 'Go', emoji: '🐹' },
  { label: 'Rust', emoji: '🦀' },
  { label: 'C++', emoji: '⚙️' },
  { label: 'PostgreSQL', emoji: '🐘' },
  { label: 'MySQL', emoji: '🐬' },
  { label: 'MongoDB', emoji: '🍃' },
  { label: 'Redis', emoji: '🔴' },
  { label: 'SQLite', emoji: '🗃️' },
  { label: 'Docker', emoji: '🐳' },
  { label: 'Kubernetes', emoji: '☸️' },
  { label: 'AWS', emoji: '☁️' },
  { label: 'GCP', emoji: '🌥️' },
  { label: 'Azure', emoji: '💠' },
  { label: 'TensorFlow', emoji: '🧠' },
  { label: 'PyTorch', emoji: '🔥' },
  { label: 'Tailwind', emoji: '💨' },
  { label: 'GraphQL', emoji: '◈' },
  { label: 'Nginx', emoji: '🌐' },
  { label: 'Linux', emoji: '🐧' },
];

const BADGES = [
  { id: 'license', label: 'License' },
  { id: 'stars', label: '⭐ Stars' },
  { id: 'forks', label: '🍴 Forks' },
  { id: 'issues', label: 'Issues' },
  { id: 'prs', label: 'PRs Welcome' },
  { id: 'build', label: 'Build Passing' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'version', label: 'Version' },
];

const DEFAULT_BADGES = new Set(['license', 'stars', 'prs']);

interface Template {
  name: string;
  tag: string;
  techs: string[];
  desc: string;
  features: string;
  installCmds?: string;
  abstractText?: string;
  methodology?: string;
  paperLink?: string;
  datasetLink?: string;
  bibtexCitation?: string;
}

const TEMPLATES: Record<string, Template> = {
  webapp: {
    name: 'My Web App',
    tag: 'A modern, full-stack web application',
    techs: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    desc: 'A full-stack web application built with modern technologies. Features user authentication, real-time updates, and a responsive UI.',
    features:
      '### 🔐 Authentication\n- JWT-based login & registration\n- OAuth support\n\n### 📊 Dashboard\n- Real-time data visualization\n- Export to CSV\n\n### 🌐 API\n- RESTful API with full CRUD\n- Rate limiting & caching',
  },
  ml: {
    name: 'ML Project',
    tag: 'Machine learning model for image classification',
    techs: ['Python', 'TensorFlow', 'FastAPI', 'Docker'],
    desc: 'A machine learning project that achieves state-of-the-art results. Includes training pipeline, model evaluation, and a REST API for inference.',
    features:
      '### 🧠 Model\n- Custom CNN architecture\n- Transfer learning support\n\n### 📈 Training\n- Mixed precision training\n- Early stopping & checkpointing\n\n### ⚡ Inference API\n- FastAPI endpoint\n- Batch prediction support',
  },
  api: {
    name: 'Backend API',
    tag: 'Production-ready REST API with authentication',
    techs: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
    desc: 'A scalable backend API built for production. Includes authentication, caching, rate limiting, and comprehensive API documentation.',
    features:
      '### 🔑 Auth\n- JWT + refresh tokens\n- Role-based access control\n\n### ⚡ Performance\n- Redis caching\n- Query optimization\n\n### 📚 Docs\n- Swagger / OpenAPI docs\n- Postman collection',
  },
  cli: {
    name: 'CLI Tool',
    tag: 'A powerful command-line tool',
    techs: ['Python', 'Go'],
    desc: 'A command-line tool that helps developers automate repetitive tasks. Supports plugins, configuration files, and shell completions.',
    features:
      '### ⚙️ Commands\n- Multiple sub-commands\n- Interactive prompts\n\n### 🔌 Plugins\n- Plugin system\n- Custom hooks\n\n### 🐚 Shell\n- Bash/Zsh/Fish completions\n- Cross-platform support',
  },
  academic: {
    name: 'Research Project',
    tag: 'Reproducible research, paper artifacts, and dataset access',
    techs: ['Python', 'PyTorch'],
    desc: 'A research repository for sharing paper artifacts, reproducible experiments, and citation information.',
    features:
      '### Research Artifacts\n- Reproducible experiment scripts\n- Evaluation notebooks and figures\n\n### Results\n- Baseline comparisons\n- Ablation studies',
    abstractText:
      'This project investigates [research problem] using [method]. It provides reproducible code, dataset access instructions, and evaluation artifacts.',
    methodology:
      '### Data Collection\n- Describe dataset source and preprocessing.\n\n### Experimental Setup\n- Document baselines, hardware, and hyperparameters.',
    paperLink: 'https://arxiv.org/abs/0000.00000',
    datasetLink: 'https://doi.org/10.0000/example-dataset',
    bibtexCitation:
      '@article{research2026,\n  title={Your Paper Title},\n  author={Author Name},\n  journal={Conference Name},\n  year={2026}\n}',
  },
  mobile: {
    name: 'Mobile App',
    tag: 'Cross-platform mobile app',
    techs: ['React', 'TypeScript', 'MongoDB'],
    desc: 'A cross-platform mobile application. Features offline support, push notifications, and a native feel on both iOS and Android.',
    features:
      '### 📱 UI/UX\n- Native animations\n- Dark mode support\n\n### 🔔 Notifications\n- Push notifications\n- In-app messaging',
  },
  lib: {
    name: 'AwesomeLib',
    tag: 'A lightweight, zero-dependency library',
    techs: ['TypeScript', 'JavaScript'],
    desc: 'A lightweight, zero-dependency library that makes complex tasks simple. Tree-shakeable, fully typed, and battle-tested in production.',
    features:
      '### 🎯 Core\n- Zero dependencies\n- Tree-shakeable\n\n### 📦 Bundle\n- ESM + CJS + UMD\n- < 5kb gzipped',
  },
  hackathon: {
    name: 'HackProject',
    tag: 'Built in 24 hours at HackathonX 2026',
    techs: ['React', 'Python', 'FastAPI', 'PostgreSQL'],
    desc: 'Award-winning hackathon project. Solves [problem] using [approach]. Won [prize] at [hackathon].',
    features:
      '### 🏆 What We Built\n- Core feature 1\n- Core feature 2\n\n### 🔮 Future Plans\n- Post-hackathon roadmap',
  },
  oss: {
    name: 'OpenProject',
    tag: 'An open-source tool loved by the community',
    techs: ['Python', 'Docker'],
    desc: 'An open-source project maintained by the community. We welcome contributions of all kinds.',
    features:
      '### ✨ Features\n- Feature 1\n- Feature 2\n\n### 🌍 Community\n- Active Discord\n- Weekly releases',
  },
};

const STORAGE_KEY = 'md-readme-builder-v2';
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5];

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  projName: string;
  tagline: string;
  ghUser: string;
  repoSlug: string;
  description: string;
  demoUrl: string;
  features: string;
  prereqs: string;
  installCmds: string;
  envVars: string;
  usageCmd: string;
  rawStructure: string;
  videoUrl: string;
  imageUrls: string;
  apiDocs: string;
  apiBase: string;
  contribNotes: string;
  authorName: string;
  authorGh: string;
  authorEmail: string;
  authorLinkedin: string;
  authorWebsite: string;
  customTech: string;
  license: string;
  supportMsg: string;
  supportBmac: string;
  supportKofi: string;
  supportPatreon: string;
  supportGhSponsors: string;
  abstractText: string;
  paperLink: string;
  datasetLink: string;
  methodology: string;
  bibtexCitation: string;
  roadmapText: string;
  faqText: string;
  ackText: string;
}

const EMPTY_FORM: FormData = {
  projName: '',
  tagline: '',
  ghUser: '',
  repoSlug: '',
  description: '',
  demoUrl: '',
  features: '',
  prereqs: '',
  installCmds: '',
  envVars: '',
  usageCmd: '',
  rawStructure: '',
  videoUrl: '',
  imageUrls: '',
  apiDocs: '',
  apiBase: '',
  contribNotes: '',
  authorName: '',
  authorGh: '',
  authorEmail: '',
  authorLinkedin: '',
  authorWebsite: '',
  customTech: '',
  license: 'MIT',
  supportMsg: '',
  supportBmac: '',
  supportKofi: '',
  supportPatreon: '',
  supportGhSponsors: '',
  abstractText: '',
  paperLink: '',
  datasetLink: '',
  methodology: '',
  bibtexCitation: '',
  roadmapText: '- [x] Initial release\n- [ ] Add dark mode\n- [ ] Write tests',
  faqText:
    'Q: How do I get started?\nA: See the Installation section above.\n\nQ: How do I contribute?\nA: Fork the repo and open a PR.',
  ackText: '',
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function isValidUrl(value: string): boolean {
  if (!value?.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function getWordCount(text: string): number {
  if (!text) return 0;
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w && w !== '###' && w !== '-').length;
}

function convertStructure(raw: string, projName: string): string {
  if (!raw.trim()) return '';
  const lines = raw.split('\n');
  const result = [`📦 ${projName}`];
  const getDepth = (line: string) => {
    const m = line.match(/^(\s*)/);
    return m ? Math.floor(m[1].length / 2) : 0;
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimEnd();
    if (!line.trim()) continue;
    const depth = getDepth(line);
    const name = line.trim();
    const isDir = name.endsWith('/');
    const cleanName = name.replace(/\/$/, '');
    let isLast = true;
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim() && getDepth(lines[j]) === depth) {
        isLast = false;
        break;
      }
      if (lines[j].trim() && getDepth(lines[j]) < depth) break;
    }
    let prefix = '';
    for (let d = 0; d < depth; d++) {
      let parentIsLast = true;
      for (let k = i - 1; k >= 0; k--) {
        if (lines[k].trim() && getDepth(lines[k]) === d) {
          for (let l = i + 1; l < lines.length; l++) {
            if (lines[l].trim() && getDepth(lines[l]) === d) {
              parentIsLast = false;
              break;
            }
            if (lines[l].trim() && getDepth(lines[l]) < d) break;
          }
          break;
        }
      }
      prefix += parentIsLast ? '   ' : ' ┃ ';
    }
    result.push(`${prefix}${isLast ? ' ┗ ' : ' ┣ '}${isDir ? '📂 ' : '📜 '}${cleanName}`);
  }
  return result.join('\n');
}

function esc(s: string): string {
  return String(s).replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildMarkdown(
  formData: FormData,
  sectionState: Record<string, boolean>,
  selectedTechs: Set<string>,
  selectedBadges: Set<string>,
  sectionOrder: string[],
): string {
  const {
    projName,
    tagline,
    ghUser: ghUserRaw,
    repoSlug: repoSlugRaw,
    description,
    demoUrl,
    features,
    prereqs,
    installCmds,
    envVars,
    usageCmd,
    rawStructure,
    videoUrl,
    imageUrls,
    apiDocs,
    apiBase,
    contribNotes,
    license,
    authorName,
    authorGh,
    authorEmail,
    authorLinkedin,
    authorWebsite,
    customTech,
    supportMsg,
    supportBmac,
    supportKofi,
    supportPatreon,
    supportGhSponsors,
    abstractText,
    paperLink,
    datasetLink,
    methodology,
    bibtexCitation,
    roadmapText,
    faqText,
    ackText,
  } = formData;

  const name = projName || 'My Project';
  const ghUser = ghUserRaw || authorGh || 'username';
  const repoSlug = repoSlugRaw || name.toLowerCase().replace(/\s+/g, '-');
  const on = (id: string) => !!sectionState[id];
  let md = '';

  const generators: Record<string, () => string> = {
    title: () => {
      let chunk = `# ${name}\n\n`;
      if (tagline) chunk += `> **${tagline}**\n\n`;
      const bs: string[] = [];
      if (selectedBadges.has('license') && license !== 'none')
        bs.push(
          `[![License](https://img.shields.io/badge/license-${encodeURIComponent(license)}-green.svg)](LICENSE)`,
        );
      if (selectedBadges.has('stars'))
        bs.push(
          `[![Stars](https://img.shields.io/github/stars/${ghUser}/${repoSlug}?style=social)](https://github.com/${ghUser}/${repoSlug})`,
        );
      if (selectedBadges.has('forks'))
        bs.push(
          `[![Forks](https://img.shields.io/github/forks/${ghUser}/${repoSlug}?style=social)](https://github.com/${ghUser}/${repoSlug}/fork)`,
        );
      if (selectedBadges.has('issues'))
        bs.push(
          `[![Issues](https://img.shields.io/github/issues/${ghUser}/${repoSlug})](https://github.com/${ghUser}/${repoSlug}/issues)`,
        );
      if (selectedBadges.has('prs'))
        bs.push(
          `[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/${ghUser}/${repoSlug}/pulls)`,
        );
      if (selectedBadges.has('build'))
        bs.push('![Build](https://img.shields.io/badge/build-passing-brightgreen)');
      if (selectedBadges.has('coverage'))
        bs.push('![Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)');
      if (selectedBadges.has('version'))
        bs.push('![Version](https://img.shields.io/badge/version-1.0.0-blue)');
      if (bs.length) chunk += bs.join(' ') + '\n\n';
      chunk += '---\n\n## 📋 Table of Contents\n\n';
      for (const id of sectionOrder) {
        if (id === 'title' || !on(id)) continue;
        const label: Record<string, string> = {
          description: '- [Description](#-description)',
          features: '- [Features](#-features)',
          techstack: '- [Tech Stack](#%EF%B8%8F-tech-stack)',
          installation: '- [Installation](#-installation)',
          structure: '- [Project Structure](#-project-structure)',
          screenshots: '- [Screenshots](#%EF%B8%8F-screenshots)',
          api: '- [API Reference](#-api-reference)',
          contributing: '- [Contributing](#-contributing)',
          author: '- [License](#-license)\n- [Author](#-author)',
          roadmap: '- [Roadmap](#%EF%B8%8F-roadmap)',
          faq: '- [FAQ](#-faq)',
          ack: '- [Acknowledgements](#-acknowledgements)',
          support: '- [Support](#%EF%B8%8F-support--donation)',
          academic: '- [Academic Details](#academic--research-details)',
        };
        if (label[id]) chunk += label[id] + '\n';
      }
      return chunk + '\n---\n\n';
    },
    description: () => {
      let chunk = '## 📌 Description\n\n';
      chunk += (description || '_Add a description of your project here._') + '\n\n';
      if (demoUrl) chunk += `🔗 **Live Demo:** [${demoUrl}](${demoUrl})\n\n`;
      return chunk + '---\n\n';
    },
    features: () => {
      if (!features.trim()) return '';
      let chunk = '## ✨ Features\n\n';
      for (const line of features.split('\n')) {
        const l = line.trimEnd();
        if (!l.trim()) {
          chunk += '\n';
          continue;
        }
        if (l.trim().startsWith('###')) chunk += '\n' + l.trim() + '\n';
        else chunk += (l.trim().startsWith('-') ? l : '- ' + l.trim()) + '\n';
      }
      return chunk + '\n---\n\n';
    },
    techstack: () => {
      const allTech = [...selectedTechs];
      if (customTech)
        for (const t of customTech.split(',')) {
          const tr = t.trim();
          if (tr) allTech.push(tr);
        }
      if (!allTech.length) return '';
      const front = allTech.filter((t) =>
        ['React', 'Vue', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind', 'HTML', 'CSS'].includes(
          t,
        ),
      );
      const back = allTech.filter((t) =>
        [
          'Node.js',
          'Express',
          'Django',
          'FastAPI',
          'Flask',
          'Spring',
          'Go',
          'Python',
          'Rust',
          'Java',
          'C++',
        ].includes(t),
      );
      const db = allTech.filter((t) =>
        ['PostgreSQL', 'MySQL', 'MongoDB', 'SQLite', 'Redis'].includes(t),
      );
      const infra = allTech.filter((t) =>
        ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Nginx', 'Linux'].includes(t),
      );
      const ml = allTech.filter((t) => ['TensorFlow', 'PyTorch', 'GraphQL'].includes(t));
      const rest = allTech.filter((t) => ![...front, ...back, ...db, ...infra, ...ml].includes(t));
      let chunk = '## 🛠️ Tech Stack\n\n| Layer | Technology |\n|---|---|\n';
      if (front.length) chunk += `| Frontend | ${front.join(', ')} |\n`;
      if (back.length) chunk += `| Backend  | ${back.join(', ')} |\n`;
      if (db.length) chunk += `| Database | ${db.join(', ')} |\n`;
      if (ml.length) chunk += `| AI / ML  | ${ml.join(', ')} |\n`;
      if (infra.length) chunk += `| DevOps   | ${infra.join(', ')} |\n`;
      if (rest.length) chunk += `| Other    | ${rest.join(', ')} |\n`;
      return chunk + '\n---\n\n';
    },
    installation: () => {
      let chunk = '## 🚀 Installation\n\n';
      if (prereqs) chunk += `**Prerequisites:** ${prereqs}\n\n`;
      if (installCmds) {
        chunk += '```bash\n' + installCmds + '\n```\n\n';
      } else {
        chunk += `\`\`\`bash\ngit clone https://github.com/${ghUser}/${repoSlug}.git\ncd ${repoSlug}\n\`\`\`\n\n`;
      }
      if (envVars)
        chunk += `**Environment Variables** — create a \`.env\` file:\n\n\`\`\`env\n${envVars}\n\`\`\`\n\n`;
      if (usageCmd) chunk += `## 💻 Usage\n\n\`\`\`bash\n${usageCmd}\n\`\`\`\n\n`;
      return chunk + '---\n\n';
    },
    structure: () => {
      if (!rawStructure.trim()) return '';
      return `## 📁 Project Structure\n\n\`\`\`\n${convertStructure(rawStructure, name)}\n\`\`\`\n\n---\n\n`;
    },
    screenshots: () => {
      if (!videoUrl && !imageUrls.trim()) return '';
      let chunk = '## 🖼️ Screenshots\n\n';
      if (videoUrl) chunk += `▶️ **Demo Video:** [Watch Here](${videoUrl})\n\n`;
      if (imageUrls.trim()) {
        for (const line of imageUrls.split('\n').filter((l) => l.trim())) {
          const parts = line.split('|').map((p) => p.trim());
          if (parts.length >= 2) chunk += `### ${parts[0]}\n\n![${parts[0]}](${parts[1]})\n\n`;
          else if (parts[0]) chunk += `![Screenshot](${parts[0]})\n\n`;
        }
      }
      return chunk + '---\n\n';
    },
    api: () => {
      if (!apiDocs.trim()) return '';
      let chunk = '## ⚡ API Reference\n\n';
      if (apiBase) chunk += `**Base URL:** \`${esc(apiBase)}\`\n\n`;
      chunk += '| Method | Endpoint | Description |\n|--------|----------|-------------|\n';
      for (const line of apiDocs.split('\n').filter((l) => l.trim())) {
        const parts = line.split('|').map((p) => p.trim());
        if (parts.length >= 2) {
          const ep = parts[0].split(' ');
          chunk += `| \`${esc(ep[0])}\` | \`${esc(ep.slice(1).join(' '))}\` | ${esc(parts[1])} |\n`;
        }
      }
      return chunk + '\n---\n\n';
    },
    contributing: () => {
      let chunk = '## 🤝 Contributing\n\nContributions are always welcome!\n\n';
      chunk += `1. Fork the repository\n2. Create your branch: \`git checkout -b feature/amazing-feature\`\n3. Commit your changes: \`git commit -m "Add amazing feature"\`\n4. Push to the branch: \`git push origin feature/amazing-feature\`\n5. Open a Pull Request\n\n`;
      if (contribNotes) chunk += contribNotes + '\n\n';
      return chunk + '---\n\n';
    },
    author: () => {
      let chunk = '';
      if (license !== 'none')
        chunk += `## 📄 License\n\nThis project is licensed under the **[${license} License](LICENSE)**.\n\n---\n\n`;
      chunk += '## 👤 Author\n\n';
      const displayName = authorName || authorGh || ghUser;
      chunk += `**${displayName}**\n\n`;
      if (authorGh) chunk += `- 🐙 GitHub: [@${authorGh}](https://github.com/${authorGh})\n`;
      if (authorEmail) chunk += `- 📧 Email: [${authorEmail}](mailto:${authorEmail})\n`;
      if (authorLinkedin) chunk += `- 💼 LinkedIn: [${displayName}](${authorLinkedin})\n`;
      if (authorWebsite) chunk += `- 🌐 Website: [${authorWebsite}](${authorWebsite})\n`;
      return (
        chunk +
        `\n---\n\n> Made with ❤️ by [${displayName}](https://github.com/${authorGh || ghUser})\n`
      );
    },
    roadmap: () => {
      if (!roadmapText.trim()) return '';
      let chunk = '## 🗺️ Roadmap\n\n';
      for (const line of roadmapText.split('\n').filter((l) => l.trim())) {
        const l = line.trim();
        if (l.startsWith('- [x]') || l.startsWith('- [ ]') || l.startsWith('-')) chunk += l + '\n';
        else chunk += `- [ ] ${l}\n`;
      }
      return chunk + '\n---\n\n';
    },
    faq: () => {
      if (!faqText.trim()) return '';
      let chunk = '## ❓ FAQ\n\n';
      const pairs = faqText.split('\n\n').filter((p) => p.trim());
      for (const pair of pairs) {
        const lines = pair.split('\n');
        const q = lines[0]?.replace(/^Q:\s*/i, '').trim();
        const a = lines[1]?.replace(/^A:\s*/i, '').trim();
        if (q) chunk += `**Q: ${q}**\n\n${a ? `A: ${a}` : ''}\n\n`;
      }
      return chunk + '---\n\n';
    },
    ack: () => {
      if (!ackText.trim()) return '';
      return `## 🙏 Acknowledgements\n\n${ackText}\n\n---\n\n`;
    },
    support: () => {
      const has = supportBmac || supportKofi || supportPatreon || supportGhSponsors;
      if (!supportMsg && !has) return '';
      let chunk = '## ❤️ Support & Donation\n\n';
      chunk +=
        supportMsg ||
        'If you find this project helpful, please consider supporting its development:\n\n';
      const links: string[] = [];
      if (supportBmac)
        links.push(
          `[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black)](https://www.buymeacoffee.com/${supportBmac})`,
        );
      if (supportKofi)
        links.push(
          `[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/${supportKofi})`,
        );
      if (supportPatreon)
        links.push(
          `[![Patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://patreon.com/${supportPatreon})`,
        );
      if (supportGhSponsors)
        links.push(
          `[![GitHub Sponsors](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors)](https://github.com/sponsors/${supportGhSponsors})`,
        );
      if (links.length) chunk += '\n\n' + links.join(' ') + '\n\n';
      return chunk + '---\n\n';
    },
    academic: () => {
      if (!abstractText && !paperLink && !datasetLink && !methodology && !bibtexCitation) return '';
      let chunk = '## 📚 Academic / Research Details\n\n';
      const aBadges: string[] = [];
      if (paperLink)
        aBadges.push(
          `[![Paper](https://img.shields.io/badge/Paper-Read%20Now-blue)](${paperLink})`,
        );
      if (datasetLink)
        aBadges.push(
          `[![Dataset](https://img.shields.io/badge/Dataset-Access-green)](${datasetLink})`,
        );
      if (aBadges.length) chunk += aBadges.join(' ') + '\n\n';
      if (abstractText) chunk += `### Abstract\n\n${abstractText}\n\n`;
      if (paperLink) chunk += `### Paper Link\n\n[${paperLink}](${paperLink})\n\n`;
      if (datasetLink) chunk += `### Dataset Access\n\n[${datasetLink}](${datasetLink})\n\n`;
      if (methodology) chunk += `### Methodology\n\n${methodology}\n\n`;
      if (bibtexCitation) chunk += `### Citation\n\n\`\`\`bibtex\n${bibtexCitation}\n\`\`\`\n\n`;
      return chunk + '---\n\n';
    },
  };

  for (const id of sectionOrder) {
    if (on(id) && generators[id]) md += generators[id]();
  }
  return md;
}

// ─── Quality score ────────────────────────────────────────────────────────────

function calculateQuality(
  formData: FormData,
  sectionState: Record<string, boolean>,
  selectedTechs: Set<string>,
): { score: number; suggestions: Array<{ icon: string; text: string }> } {
  let score = 0;
  const suggestions: Array<{ icon: string; text: string }> = [];
  const {
    projName,
    tagline,
    ghUser,
    repoSlug,
    description,
    features,
    customTech,
    installCmds,
    usageCmd,
    authorName,
    authorGh,
    videoUrl,
    imageUrls,
    demoUrl,
    license,
  } = formData;

  if (projName) score += 10;
  else suggestions.push({ icon: '📌', text: 'Add a project name.' });
  if (tagline) score += 5;
  else suggestions.push({ icon: '💬', text: 'Add a one-line tagline.' });
  if (ghUser && repoSlug) score += 5;
  else suggestions.push({ icon: '🔗', text: 'Fill in GitHub username and repo name.' });
  const descWords = description
    ? description
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length
    : 0;
  if (descWords >= 30) score += 15;
  else if (descWords >= 15) {
    score += 8;
    suggestions.push({ icon: '📋', text: 'Expand description to 30+ words.' });
  } else if (descWords > 0) {
    score += 3;
    suggestions.push({ icon: '📋', text: 'Description is very short.' });
  } else suggestions.push({ icon: '📋', text: 'Add a project description.' });
  if (sectionState.features && features?.trim().length > 20) score += 15;
  else suggestions.push({ icon: '✨', text: 'Enable and fill in the Features section.' });
  const totalTechs =
    selectedTechs.size + (customTech ? customTech.split(',').filter((t) => t.trim()).length : 0);
  if (totalTechs >= 3) score += 10;
  else if (totalTechs >= 1) {
    score += 5;
    suggestions.push({ icon: '🛠️', text: 'Select at least 3 technologies.' });
  } else suggestions.push({ icon: '🛠️', text: 'Select your tech stack.' });
  if (sectionState.installation && installCmds) score += 10;
  else if (sectionState.installation) {
    score += 4;
    suggestions.push({ icon: '🚀', text: 'Add installation commands.' });
  } else suggestions.push({ icon: '🚀', text: 'Enable the Installation section.' });
  if (sectionState.installation && usageCmd) score += 5;
  else suggestions.push({ icon: '💻', text: 'Add usage instructions.' });
  if (sectionState.author && (authorName || authorGh)) score += 5;
  else suggestions.push({ icon: '👤', text: 'Fill in author details.' });
  if (sectionState.screenshots && (videoUrl || imageUrls?.trim())) score += 5;
  else suggestions.push({ icon: '🖼️', text: 'Add screenshots or a demo video.' });
  if (demoUrl?.trim()) score += 5;
  else suggestions.push({ icon: '🔗', text: 'Add a live demo URL.' });
  if (sectionState.contributing) score += 5;
  else suggestions.push({ icon: '🤝', text: 'Enable the Contributing section.' });
  if (sectionState.author && license !== 'none') score += 5;
  else if (license === 'none') suggestions.push({ icon: '📄', text: 'Choose a license.' });
  return { score: Math.min(score, 100), suggestions };
}

function qualityColor(s: number) {
  if (s >= 80) return '#10b981';
  if (s >= 55) return '#f59e0b';
  if (s >= 30) return '#f97316';
  return '#f43f5e';
}
function qualityLabel(s: number) {
  if (s >= 80) return 'Excellent';
  if (s >= 55) return 'Good';
  if (s >= 30) return 'Needs Work';
  return 'Incomplete';
}

// ─── Shared field styles ──────────────────────────────────────────────────────

const inputCls =
  'w-full px-3 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-colors placeholder:text-slate-400';
const labelCls =
  'block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1';
const sectionCardCls =
  'border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-white dark:bg-[#0d1117]';

function WordCount({ text }: { text: string }) {
  const n = getWordCount(text);
  return (
    <span className="text-[11px] text-slate-400 mt-1 block">
      {n} {n === 1 ? 'word' : 'words'}
    </span>
  );
}

function UrlInput({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const valid = isValidUrl(value);
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input
        id={id}
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} ${!valid ? 'border-amber-400 focus:border-amber-500' : ''}`}
      />
      {!valid && (
        <p className="text-[11px] text-amber-500 mt-1">
          ⚠ Enter a valid URL starting with https://
        </p>
      )}
    </div>
  );
}

// ─── GitHub Auto-fill ─────────────────────────────────────────────────────────

function GitHubAutoFill({
  onFill,
}: {
  onFill: (patch: Partial<FormData>, techs?: string[]) => void;
}) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Array<{ id: string; name: string; createdAt: number }>>([]);
  const [selectedToken, setSelectedToken] = useState('');
  const [open, setOpen] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [newName, setNewName] = useState('');
  const [newVal, setNewVal] = useState('');
  const [showPat, setShowPat] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listTokens()
      .then(setTokens)
      .catch(() => {});
  }, []);

  const handleFetch = async () => {
    setError(null);
    const m = url.match(/github\.com\/([^/]+)\/([^/?\s#]+)/);
    if (!m) {
      setError('Enter a valid GitHub repo URL');
      return;
    }
    const [, owner, repo] = m;
    const slug = repo.replace(/\.git$/, '');
    setLoading(true);
    try {
      const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
      if (selectedToken) {
        const p = await getToken(selectedToken);
        if (p) headers.Authorization = `Bearer ${p}`;
      }
      const res = await fetch(`https://api.github.com/repos/${owner}/${slug}`, { headers });
      if (!res.ok) {
        if (res.status === 404) throw new Error('Repo not found. Private? Add a PAT below.');
        if (res.status === 403) throw new Error('Rate limited. Add a GitHub PAT.');
        throw new Error(`GitHub API: ${res.status}`);
      }
      const gh = await res.json();
      const topics: string[] = gh.topics ?? [];
      const topicTechs = TECHS.filter((t) =>
        topics.map((x: string) => x.toLowerCase()).includes(t.label.toLowerCase()),
      ).map((t) => t.label);
      onFill(
        {
          projName: gh.name ?? '',
          tagline: gh.description ?? '',
          ghUser: owner,
          repoSlug: slug,
          license: gh.license?.spdx_id ?? 'MIT',
          installCmds: `git clone ${gh.clone_url}\ncd ${slug}\nnpm install`,
        },
        topicTechs,
      );
      toast.success(`Auto-filled from ${owner}/${slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToken = async () => {
    if (!newName.trim() || !newVal.trim()) return;
    setSaving(true);
    try {
      await addToken(newName.trim(), newVal.trim());
      const list = await listTokens();
      setTokens(list);
      setNewName('');
      setNewVal('');
      toast.success(`Token "${newName}" saved`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-slate-700 dark:text-slate-300 font-medium text-xs"
      >
        <span className="flex items-center gap-2">
          <GithubIcon className="h-3.5 w-3.5" /> Auto-fill from GitHub
        </span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="p-3 space-y-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
              placeholder="https://github.com/vercel/next.js"
              className={`${inputCls} flex-1 text-xs`}
              aria-label="GitHub repository URL"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleFetch}
              disabled={loading || !url.trim()}
              className="shrink-0 text-xs bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 h-9"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Fetch'}
            </Button>
          </div>
          {tokens.length > 0 && (
            <div>
              <label htmlFor="gh-token-sel" className={labelCls}>
                Auth Token (for private repos)
              </label>
              <select
                id="gh-token-sel"
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className={inputCls}
              >
                <option value="">None (public only)</option>
                {tokens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowVault((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <Key className="h-3 w-3" /> {showVault ? 'Hide' : 'Manage'} PAT tokens
          </button>
          {showVault && (
            <div className="space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Token name"
                className={`${inputCls} text-xs`}
                aria-label="PAT name"
              />
              <div className="flex gap-2">
                <input
                  type={showPat ? 'text' : 'password'}
                  value={newVal}
                  onChange={(e) => setNewVal(e.target.value)}
                  placeholder="ghp_..."
                  className={`${inputCls} flex-1 text-xs font-mono`}
                  aria-label="PAT value"
                />
                <button
                  type="button"
                  onClick={() => setShowPat((v) => !v)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showPat ? 'Hide token' : 'Show token'}
                >
                  {showPat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSaveToken}
                disabled={saving || !newName.trim() || !newVal.trim()}
                className="w-full text-xs"
              >
                {saving ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Key className="h-3 w-3 mr-1" />
                )}{' '}
                Save Token
              </Button>
            </div>
          )}
          {error && (
            <p className="text-[11px] text-red-500 bg-red-50 dark:bg-red-950/40 px-2 py-1.5 rounded">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({
  sectionState,
  toggleSection,
  sectionOrder,
  setSectionOrder,
  selectedTechs,
  onApplyTemplate,
  activeTemplate,
  formData,
  onFill,
}: {
  sectionState: Record<string, boolean>;
  toggleSection: (id: string, v: boolean) => void;
  sectionOrder: string[];
  setSectionOrder: (o: string[]) => void;
  selectedTechs: Set<string>;
  onApplyTemplate: (key: string) => void;
  activeTemplate: string | null;
  formData: FormData;
  onFill: (patch: Partial<FormData>, techs?: string[]) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const activeSectionCount = Object.values(sectionState).filter(Boolean).length;
  const quality = calculateQuality(formData, sectionState, selectedTechs);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnter = (_e: React.DragEvent, targetIdx: number) => {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const next = [...sectionOrder];
    const [item] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, item);
    setDragIdx(targetIdx);
    setSectionOrder(next);
  };
  const handleDragEnd = () => setDragIdx(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Section count + quality */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between shrink-0">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-bold text-blue-600 dark:text-blue-400">{activeSectionCount}</span>{' '}
          sections active
        </span>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${quality.score}%`, background: qualityColor(quality.score) }}
            />
          </div>
          <span
            className="text-[11px] font-semibold"
            style={{ color: qualityColor(quality.score) }}
          >
            {quality.score}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 p-3">
        {/* Templates */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Templates
          </p>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={() => onApplyTemplate(key)}
                className={`text-left text-[11px] px-2 py-1.5 rounded-md border transition-all truncate ${
                  activeTemplate === key
                    ? 'bg-blue-600 border-blue-600 text-white font-medium'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900'
                }`}
                title={t.name}
              >
                {
                  {
                    webapp: '🌐',
                    ml: '🤖',
                    api: '⚡',
                    cli: '💻',
                    academic: '🎓',
                    mobile: '📱',
                    lib: '📦',
                    hackathon: '🏆',
                    oss: '🔓',
                  }[key]
                }{' '}
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Sections <span className="normal-case font-normal">(drag to reorder)</span>
          </p>
          <div className="space-y-0.5">
            {sectionOrder.map((id, idx) => {
              const def = SECTION_DEFS.find((s) => s.id === id);
              if (!def) return null;
              const isOn = !!sectionState[id];
              return (
                <div
                  key={id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragEnter={(e) => handleDragEnter(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md select-none transition-all cursor-grab active:cursor-grabbing ${
                    dragIdx === idx
                      ? 'opacity-50 bg-blue-50 dark:bg-blue-950/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Drag handle dots */}
                  <svg
                    width="8"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="text-slate-300 dark:text-slate-600 shrink-0"
                  >
                    <circle cx="9" cy="5" r="1.5" />
                    <circle cx="15" cy="5" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" />
                    <circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="19" r="1.5" />
                    <circle cx="15" cy="19" r="1.5" />
                  </svg>
                  <span className="text-sm shrink-0">{def.icon}</span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 flex-1 truncate">
                    {def.label}
                  </span>
                  {/* Toggle */}
                  <label
                    className="relative inline-flex items-center cursor-pointer shrink-0"
                    aria-label={`Toggle ${def.label}`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isOn}
                      onChange={(e) => toggleSection(id, e.target.checked)}
                    />
                    <div
                      className={`w-7 h-4 rounded-full transition-colors ${isOn ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isOn ? 'translate-x-3' : 'translate-x-0'}`}
                      />
                    </div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* GitHub auto-fill */}
        <GitHubAutoFill onFill={onFill} />
      </div>
    </div>
  );
}

// ─── Editor panel ─────────────────────────────────────────────────────────────

function EditorPanel({
  formData,
  updateField,
  sectionState,
  sectionOrder,
  selectedTechs,
  toggleTech,
  selectedBadges,
  toggleBadge,
}: {
  formData: FormData;
  updateField: (k: keyof FormData, v: string) => void;
  sectionState: Record<string, boolean>;
  sectionOrder: string[];
  selectedTechs: Set<string>;
  toggleTech: (label: string) => void;
  selectedBadges: Set<string>;
  toggleBadge: (id: string) => void;
}) {
  const on = (id: string) => !!sectionState[id];
  const f = formData;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-5 py-5 space-y-4">
        {/* Title */}
        {sectionOrder.includes('title') && on('title') && (
          <section id="sec-title" aria-labelledby="sec-title-h" className={sectionCardCls}>
            <h3
              id="sec-title-h"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2"
            >
              📌 Project Title &amp; Badges
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="projName" className={labelCls}>
                  Project Name *
                </label>
                <input
                  id="projName"
                  type="text"
                  value={f.projName}
                  onChange={(e) => updateField('projName', e.target.value)}
                  placeholder="AwesomeProject"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="tagline" className={labelCls}>
                  Tagline
                </label>
                <input
                  id="tagline"
                  type="text"
                  value={f.tagline}
                  onChange={(e) => updateField('tagline', e.target.value)}
                  placeholder="A blazing-fast tool for..."
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="ghUser" className={labelCls}>
                  GitHub Username
                </label>
                <input
                  id="ghUser"
                  type="text"
                  value={f.ghUser}
                  onChange={(e) => updateField('ghUser', e.target.value)}
                  placeholder="octocat"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="repoSlug" className={labelCls}>
                  Repo Name
                </label>
                <input
                  id="repoSlug"
                  type="text"
                  value={f.repoSlug}
                  onChange={(e) => updateField('repoSlug', e.target.value)}
                  placeholder="awesome-project"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Badges — click to toggle</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {BADGES.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBadge(b.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${selectedBadges.has(b.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'}`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
        {/* Description */}
        {sectionOrder.includes('description') && on('description') && (
          <section id="sec-description" aria-labelledby="sec-desc-h" className={sectionCardCls}>
            <h3
              id="sec-desc-h"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              📋 Description
            </h3>
            <div>
              <label htmlFor="description" className={labelCls}>
                Short Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={f.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="What does your project do? What problem does it solve?"
                className={`${inputCls} resize-none`}
              />
              <WordCount text={f.description} />
            </div>
            <UrlInput
              id="demoUrl"
              label="Live Demo URL (optional)"
              value={f.demoUrl}
              onChange={(v) => updateField('demoUrl', v)}
              placeholder="https://yourapp.com"
            />
          </section>
        )}
        {/* Features */}
        {sectionOrder.includes('features') && on('features') && (
          <section id="sec-features" aria-labelledby="sec-feat-h" className={sectionCardCls}>
            <h3
              id="sec-feat-h"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              ✨ Features
            </h3>
            <div>
              <label htmlFor="features" className={labelCls}>
                Key Features — use "### Category" for groups, "- item" for bullets
              </label>
              <textarea
                id="features"
                rows={7}
                value={f.features}
                onChange={(e) => updateField('features', e.target.value)}
                placeholder={
                  '### 🔐 Authentication\n- Email OTP verification\n- Secure login / logout\n\n### 📝 Posts\n- Create, Read, Update, Delete'
                }
                className={`${inputCls} resize-none font-mono text-xs`}
              />
              <WordCount text={f.features} />
            </div>
          </section>
        )}
        {/* Tech Stack */}
        {sectionOrder.includes('techstack') && on('techstack') && (
          <section id="sec-techstack" aria-labelledby="sec-tech-h" className={sectionCardCls}>
            <h3
              id="sec-tech-h"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              🛠️ Tech Stack{' '}
              {selectedTechs.size > 0 && (
                <span className="text-xs font-normal text-blue-600 dark:text-blue-400 ml-2">
                  {selectedTechs.size} selected
                </span>
              )}
            </h3>
            <div>
              <label className={labelCls}>Click to select your stack</label>
              <div className="flex flex-wrap gap-1.5">
                {TECHS.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => toggleTech(t.label)}
                    aria-pressed={selectedTechs.has(t.label)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${selectedTechs.has(t.label) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'}`}
                  >
                    <span>{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="customTech" className={labelCls}>
                Custom (comma separated)
              </label>
              <input
                id="customTech"
                type="text"
                value={f.customTech}
                onChange={(e) => updateField('customTech', e.target.value)}
                placeholder="Celery, Redis, Nginx..."
                className={inputCls}
              />
            </div>
          </section>
        )}
        {/* Installation */}
        {sectionOrder.includes('installation') && on('installation') && (
          <section id="sec-installation" aria-labelledby="sec-inst-h" className={sectionCardCls}>
            <h3
              id="sec-inst-h"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              🚀 Installation &amp; Usage
            </h3>
            <div>
              <label htmlFor="prereqs" className={labelCls}>
                Prerequisites
              </label>
              <input
                id="prereqs"
                type="text"
                value={f.prereqs}
                onChange={(e) => updateField('prereqs', e.target.value)}
                placeholder="Python 3.10+, Node.js 18+"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="installCmds" className={labelCls}>
                Install Commands (one per line)
              </label>
              <textarea
                id="installCmds"
                rows={5}
                value={f.installCmds}
                onChange={(e) => updateField('installCmds', e.target.value)}
                placeholder={'git clone https://github.com/user/repo.git\ncd repo\nnpm install'}
                className={`${inputCls} resize-none font-mono text-xs`}
              />
              <WordCount text={f.installCmds} />
            </div>
            <div>
              <label htmlFor="envVars" className={labelCls}>
                Environment Variables (optional)
              </label>
              <textarea
                id="envVars"
                rows={3}
                value={f.envVars}
                onChange={(e) => updateField('envVars', e.target.value)}
                placeholder={'SECRET_KEY=your_secret\nDATABASE_URL=sqlite:///db.sqlite3'}
                className={`${inputCls} resize-none font-mono text-xs`}
              />
            </div>
            <div>
              <label htmlFor="usageCmd" className={labelCls}>
                Run / Usage Commands
              </label>
              <textarea
                id="usageCmd"
                rows={3}
                value={f.usageCmd}
                onChange={(e) => updateField('usageCmd', e.target.value)}
                placeholder={'python manage.py runserver\n\n# Open http://127.0.0.1:8000/'}
                className={`${inputCls} resize-none font-mono text-xs`}
              />
              <WordCount text={f.usageCmd} />
            </div>
          </section>
        )}
        {/* Folder Structure */}
        {sectionOrder.includes('structure') && on('structure') && (
          <section id="sec-structure" aria-labelledby="sec-struct-h" className={sectionCardCls}>
            <h3
              id="sec-struct-h"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              📁 Folder Structure
            </h3>
            <div>
              <label htmlFor="rawStructure" className={labelCls}>
                Paste your folder structure (indented with spaces)
              </label>
              <textarea
                id="rawStructure"
                rows={6}
                value={f.rawStructure}
                onChange={(e) => updateField('rawStructure', e.target.value)}
                placeholder={'src/\n  api/\n  models/\n  utils/\nmain.py\nrequirements.txt'}
                className={`${inputCls} resize-none font-mono text-xs`}
              />
            </div>
            {f.rawStructure.trim() && (
              <div>
                <p className={labelCls}>Preview</p>
                <pre className="text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3 overflow-x-auto whitespace-pre font-mono text-slate-700 dark:text-slate-300">
                  {convertStructure(f.rawStructure, f.projName || 'project')}
                </pre>
              </div>
            )}
          </section>
        )}
        {/* Screenshots */}
        {sectionOrder.includes('screenshots') && on('screenshots') && (
          <section id="sec-screenshots" aria-labelledby="sec-ss-h" className={sectionCardCls}>
            <h3 id="sec-ss-h" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              🖼️ Screenshots &amp; Demo
            </h3>
            <UrlInput
              id="videoUrl"
              label="Demo Video URL (optional)"
              value={f.videoUrl}
              onChange={(v) => updateField('videoUrl', v)}
              placeholder="https://youtube.com/watch?v=..."
            />
            <div>
              <label htmlFor="imageUrls" className={labelCls}>
                Image URLs (format: Label | URL, one per line)
              </label>
              <textarea
                id="imageUrls"
                rows={4}
                value={f.imageUrls}
                onChange={(e) => updateField('imageUrls', e.target.value)}
                placeholder={
                  'Dashboard | https://i.imgur.com/abc.png\nMobile | https://i.imgur.com/xyz.png'
                }
                className={`${inputCls} resize-none font-mono text-xs`}
              />
            </div>
          </section>
        )}
        {/* API */}
        {sectionOrder.includes('api') && on('api') && (
          <section id="sec-api" aria-labelledby="sec-api-h" className={sectionCardCls}>
            <h3 id="sec-api-h" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              ⚡ API Reference
            </h3>
            <div>
              <label htmlFor="apiDocs" className={labelCls}>
                Endpoints — format: METHOD /path | Description
              </label>
              <textarea
                id="apiDocs"
                rows={5}
                value={f.apiDocs}
                onChange={(e) => updateField('apiDocs', e.target.value)}
                placeholder={
                  'GET /api/users | Get all users\nPOST /api/users | Create a new user\nDELETE /api/users/:id | Delete user'
                }
                className={`${inputCls} resize-none font-mono text-xs`}
              />
              <WordCount text={f.apiDocs} />
            </div>
            <div>
              <label htmlFor="apiBase" className={labelCls}>
                Base URL (optional)
              </label>
              <input
                id="apiBase"
                type="text"
                value={f.apiBase}
                onChange={(e) => updateField('apiBase', e.target.value)}
                placeholder="https://api.yourapp.com/v1"
                className={inputCls}
              />
            </div>
          </section>
        )}
        {/* Contributing */}
        {sectionOrder.includes('contributing') && on('contributing') && (
          <section id="sec-contributing" aria-labelledby="sec-contrib-h" className={sectionCardCls}>
            <h3
              id="sec-contrib-h"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              🤝 Contributing
            </h3>
            <div>
              <label htmlFor="contribNotes" className={labelCls}>
                Custom Notes (optional — default fork/PR guide is auto-generated)
              </label>
              <textarea
                id="contribNotes"
                rows={4}
                value={f.contribNotes}
                onChange={(e) => updateField('contribNotes', e.target.value)}
                placeholder="Any specific guidelines, code style rules, branch naming conventions..."
                className={`${inputCls} resize-none`}
              />
              <WordCount text={f.contribNotes} />
            </div>
          </section>
        )}
        {/* License & Author */}
        {sectionOrder.includes('author') && on('author') && (
          <section id="sec-author" aria-labelledby="sec-auth-h" className={sectionCardCls}>
            <h3
              id="sec-auth-h"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              👤 License &amp; Author
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="license" className={labelCls}>
                  License
                </label>
                <select
                  id="license"
                  value={f.license}
                  onChange={(e) => updateField('license', e.target.value)}
                  className={inputCls}
                >
                  {[
                    'MIT',
                    'Apache-2.0',
                    'GPL-3.0',
                    'BSD-3-Clause',
                    'ISC',
                    'Unlicense',
                    'AGPL-3.0',
                    'none',
                  ].map((l) => (
                    <option key={l} value={l}>
                      {l === 'none' ? 'No License' : l}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="authorName" className={labelCls}>
                  Full Name
                </label>
                <input
                  id="authorName"
                  type="text"
                  value={f.authorName}
                  onChange={(e) => updateField('authorName', e.target.value)}
                  placeholder="Your Name"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="authorGh" className={labelCls}>
                  GitHub Username
                </label>
                <input
                  id="authorGh"
                  type="text"
                  value={f.authorGh}
                  onChange={(e) => updateField('authorGh', e.target.value)}
                  placeholder="username"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="authorEmail" className={labelCls}>
                  Email (optional)
                </label>
                <input
                  id="authorEmail"
                  type="email"
                  value={f.authorEmail}
                  onChange={(e) => updateField('authorEmail', e.target.value)}
                  placeholder="you@email.com"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <UrlInput
                id="authorLinkedin"
                label="LinkedIn (optional)"
                value={f.authorLinkedin}
                onChange={(v) => updateField('authorLinkedin', v)}
                placeholder="https://linkedin.com/in/you"
              />
              <UrlInput
                id="authorWebsite"
                label="Portfolio (optional)"
                value={f.authorWebsite}
                onChange={(v) => updateField('authorWebsite', v)}
                placeholder="https://yoursite.com"
              />
            </div>
          </section>
        )}
        {/* Roadmap */}
        {sectionOrder.includes('roadmap') && on('roadmap') && (
          <section id="sec-roadmap" aria-labelledby="sec-road-h" className={sectionCardCls}>
            <h3
              id="sec-road-h"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              🗺️ Roadmap
            </h3>
            <div>
              <label htmlFor="roadmapText" className={labelCls}>
                Items — use "- [x]" for done, "- [ ]" for planned
              </label>
              <textarea
                id="roadmapText"
                rows={5}
                value={f.roadmapText}
                onChange={(e) => updateField('roadmapText', e.target.value)}
                placeholder={'- [x] Initial release\n- [ ] Add dark mode\n- [ ] Write tests'}
                className={`${inputCls} resize-none font-mono text-xs`}
              />
            </div>
          </section>
        )}
        {/* FAQ */}
        {sectionOrder.includes('faq') && on('faq') && (
          <section id="sec-faq" aria-labelledby="sec-faq-h" className={sectionCardCls}>
            <h3 id="sec-faq-h" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              ❓ FAQ
            </h3>
            <div>
              <label htmlFor="faqText" className={labelCls}>
                Q&amp;A pairs — format: Q: question\nA: answer (blank line between pairs)
              </label>
              <textarea
                id="faqText"
                rows={6}
                value={f.faqText}
                onChange={(e) => updateField('faqText', e.target.value)}
                placeholder={
                  'Q: How do I get started?\nA: See the Installation section.\n\nQ: How do I contribute?\nA: Fork and open a PR.'
                }
                className={`${inputCls} resize-none font-mono text-xs`}
              />
            </div>
          </section>
        )}
        {/* Acknowledgements */}
        {sectionOrder.includes('ack') && on('ack') && (
          <section id="sec-ack" aria-labelledby="sec-ack-h" className={sectionCardCls}>
            <h3 id="sec-ack-h" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              🙏 Acknowledgements
            </h3>
            <div>
              <label htmlFor="ackText" className={labelCls}>
                Credits and thanks
              </label>
              <textarea
                id="ackText"
                rows={4}
                value={f.ackText}
                onChange={(e) => updateField('ackText', e.target.value)}
                placeholder={
                  '- [Awesome Library](https://example.com) — for solving X\n- @contributor — for the initial idea'
                }
                className={`${inputCls} resize-none`}
              />
              <WordCount text={f.ackText} />
            </div>
          </section>
        )}
        {/* Support & Donation */}
        {sectionOrder.includes('support') && on('support') && (
          <section id="sec-support" aria-labelledby="sec-sup-h" className={sectionCardCls}>
            <h3 id="sec-sup-h" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              ❤️ Support &amp; Donation
            </h3>
            <div>
              <label htmlFor="supportMsg" className={labelCls}>
                Support Message (optional)
              </label>
              <textarea
                id="supportMsg"
                rows={2}
                value={f.supportMsg}
                onChange={(e) => updateField('supportMsg', e.target.value)}
                placeholder="If you find this project helpful, please consider supporting..."
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['supportBmac', 'Buy Me a Coffee'],
                ['supportKofi', 'Ko-fi'],
                ['supportPatreon', 'Patreon'],
                ['supportGhSponsors', 'GitHub Sponsors'],
              ].map(([field, label]) => (
                <div key={field}>
                  <label htmlFor={field} className={labelCls}>
                    {label} Username
                  </label>
                  <input
                    id={field}
                    type="text"
                    value={f[field as keyof FormData]}
                    onChange={(e) => updateField(field as keyof FormData, e.target.value)}
                    placeholder="username"
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
          </section>
        )}
        {/* Academic */}
        {sectionOrder.includes('academic') && on('academic') && (
          <section id="sec-academic" aria-labelledby="sec-acad-h" className={sectionCardCls}>
            <h3
              id="sec-acad-h"
              className="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              📚 Academic / Research
            </h3>
            <div>
              <label htmlFor="abstractText" className={labelCls}>
                Abstract
              </label>
              <textarea
                id="abstractText"
                rows={4}
                value={f.abstractText}
                onChange={(e) => updateField('abstractText', e.target.value)}
                placeholder="Summarize the research problem, approach, and key findings."
                className={`${inputCls} resize-none`}
              />
              <WordCount text={f.abstractText} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <UrlInput
                id="paperLink"
                label="Paper Link"
                value={f.paperLink}
                onChange={(v) => updateField('paperLink', v)}
                placeholder="https://arxiv.org/abs/..."
              />
              <UrlInput
                id="datasetLink"
                label="Dataset Access"
                value={f.datasetLink}
                onChange={(v) => updateField('datasetLink', v)}
                placeholder="https://doi.org/..."
              />
            </div>
            <div>
              <label htmlFor="methodology" className={labelCls}>
                Methodology
              </label>
              <textarea
                id="methodology"
                rows={5}
                value={f.methodology}
                onChange={(e) => updateField('methodology', e.target.value)}
                placeholder={
                  '### Data Collection\n- Describe dataset source\n\n### Experiments\n- Describe model and baselines'
                }
                className={`${inputCls} resize-none font-mono text-xs`}
              />
              <WordCount text={f.methodology} />
            </div>
            <div>
              <label htmlFor="bibtexCitation" className={labelCls}>
                BibTeX Citation
              </label>
              <textarea
                id="bibtexCitation"
                rows={6}
                value={f.bibtexCitation}
                onChange={(e) => updateField('bibtexCitation', e.target.value)}
                placeholder={
                  '@article{yourpaper2026,\n  title={Your Paper Title},\n  author={First Author},\n  journal={Conference},\n  year={2026}\n}'
                }
                className={`${inputCls} resize-none font-mono text-xs`}
              />
            </div>
          </section>
        )}
        <div className="h-8" /> {/* bottom padding */}
      </div>
    </div>
  );
}

// ─── Preview panel ────────────────────────────────────────────────────────────

function PreviewPanel({
  currentMd,
  formData,
  sectionState,
  selectedTechs,
}: {
  currentMd: string;
  formData: FormData;
  sectionState: Record<string, boolean>;
  selectedTechs: Set<string>;
}) {
  const [tab, setTab] = useState<'rendered' | 'raw'>('rendered');
  const [zoom, setZoom] = useState(1);
  const [qualityOpen, setQualityOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const quality = calculateQuality(formData, sectionState, selectedTechs);
  const hasContent = !!currentMd.trim();
  const zoomIdx = ZOOM_LEVELS.indexOf(zoom);
  const color = qualityColor(quality.score);
  const label = qualityLabel(quality.score);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(
          (z) => ZOOM_LEVELS[Math.min(ZOOM_LEVELS.length - 1, ZOOM_LEVELS.indexOf(z) + 1)] ?? z,
        );
      }
      if (e.key === '-') {
        e.preventDefault();
        setZoom((z) => ZOOM_LEVELS[Math.max(0, ZOOM_LEVELS.indexOf(z) - 1)] ?? z);
      }
      if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800/60 shrink-0 gap-2">
        <div className="flex gap-0.5 bg-slate-100 dark:bg-slate-900 rounded-md p-0.5">
          {(['rendered', 'raw'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`text-[11px] px-2.5 py-1 rounded transition-all font-medium capitalize ${tab === t ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
            >
              {t === 'raw' ? 'Raw MD' : 'Preview'}
            </button>
          ))}
        </div>
        {/* Zoom */}
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setZoom(ZOOM_LEVELS[Math.max(0, zoomIdx - 1)])}
            disabled={zoomIdx <= 0}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="w-8 text-center font-mono">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => setZoom(ZOOM_LEVELS[Math.min(ZOOM_LEVELS.length - 1, zoomIdx + 1)])}
            disabled={zoomIdx >= ZOOM_LEVELS.length - 1}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            className="text-[10px] px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
            aria-label="Reset zoom"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Quality score banner */}
      {hasContent && (
        <div className="border-b border-slate-200 dark:border-slate-800/60 shrink-0">
          <button
            type="button"
            onClick={() => setQualityOpen((o) => !o)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs">📊</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                README Quality
              </span>
              <span
                className="text-xs font-bold px-1.5 py-0.5 rounded"
                style={{ background: color + '20', color }}
              >
                {quality.score}/100 — {label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${quality.score}%`, background: color }}
                />
              </div>
              {qualityOpen ? (
                <ChevronUp className="h-3 w-3 text-slate-400" />
              ) : (
                <ChevronDown className="h-3 w-3 text-slate-400" />
              )}
            </div>
          </button>
          {qualityOpen && quality.suggestions.length > 0 && (
            <div className="px-3 pb-2 space-y-1">
              {quality.suggestions.map((s) => (
                <div
                  key={s.text}
                  className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400"
                >
                  <span>{s.icon}</span>
                  <span>{s.text}</span>
                </div>
              ))}
            </div>
          )}
          {qualityOpen && quality.suggestions.length === 0 && (
            <div className="px-3 pb-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              🎉 All key sections are complete — great job!
            </div>
          )}
        </div>
      )}

      {/* Preview body */}
      <div ref={previewRef} className="flex-1 overflow-auto">
        {!hasContent ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 gap-3 p-6 text-center">
            <Sparkles className="h-10 w-10 opacity-20" />
            <p className="text-sm">
              Fill in sections on the left — your README appears here in real time.
            </p>
          </div>
        ) : tab === 'rendered' ? (
          <div
            style={{
              transformOrigin: 'top left',
              transform: `scale(${zoom})`,
              width: zoom !== 1 ? `${100 / zoom}%` : undefined,
            }}
          >
            <MarkdownPreview content={currentMd} />
          </div>
        ) : (
          <pre className="p-4 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words leading-relaxed">
            {currentMd}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function defaultSectionState() {
  const s: Record<string, boolean> = {};
  for (const def of SECTION_DEFS) s[def.id] = def.defaultOn;
  return s;
}

export default function ReadmeBuilderPage() {
  const router = useRouter();
  const { createDocument } = useWorkspaceStore();

  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [sectionState, setSectionState] = useState<Record<string, boolean>>(defaultSectionState);
  const [sectionOrder, setSectionOrder] = useState<string[]>(SECTION_DEFS.map((s) => s.id));
  const [selectedTechs, setSelectedTechs] = useState<Set<string>>(new Set());
  const [selectedBadges, setSelectedBadges] = useState<Set<string>>(new Set(DEFAULT_BADGES));
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  // Resizable panels
  const [sidebarW, setSidebarW] = useState(260);
  const [previewW, setPreviewW] = useState(460);

  const handleSidebarResize = useCallback(
    (e: React.MouseEvent) => {
      const startX = e.clientX;
      const startW = sidebarW;
      const onMove = (ev: MouseEvent) =>
        setSidebarW(Math.max(180, Math.min(440, startW + (ev.clientX - startX))));
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [sidebarW],
  );

  const handlePreviewResize = useCallback(
    (e: React.MouseEvent) => {
      const startX = e.clientX;
      const startW = previewW;
      const onMove = (ev: MouseEvent) =>
        setPreviewW(Math.max(300, Math.min(700, startW - (ev.clientX - startX))));
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [previewW],
  );

  // Restore from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.formData) setFormData({ ...EMPTY_FORM, ...saved.formData });
      if (saved.sectionState) setSectionState((prev) => ({ ...prev, ...saved.sectionState }));
      if (saved.sectionOrder) setSectionOrder(saved.sectionOrder);
      if (saved.techs) setSelectedTechs(new Set(saved.techs));
      if (saved.badges) setSelectedBadges(new Set(saved.badges));
      if (saved.activeTemplate) setActiveTemplate(saved.activeTemplate);
    } catch {
      /* corrupt data */
    }
  }, []);

  // Auto-save (debounced 600ms)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            formData,
            sectionState,
            sectionOrder,
            techs: [...selectedTechs],
            badges: [...selectedBadges],
            activeTemplate,
          }),
        );
        setAutoSaved(true);
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(() => setAutoSaved(false), 2000);
      } catch {
        /* storage full */
      }
    }, 600);
  }, [formData, sectionState, sectionOrder, selectedTechs, selectedBadges, activeTemplate]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — trigger on state changes
  useEffect(() => {
    scheduleSave();
  }, [formData, sectionState, sectionOrder, selectedTechs, selectedBadges]);

  const currentMd = useMemo(
    () => buildMarkdown(formData, sectionState, selectedTechs, selectedBadges, sectionOrder),
    [formData, sectionState, selectedTechs, selectedBadges, sectionOrder],
  );

  const updateField = useCallback((k: keyof FormData, v: string) => {
    setFormData((prev) => ({ ...prev, [k]: v }));
  }, []);

  const toggleSection = useCallback((id: string, v: boolean) => {
    setSectionState((prev) => ({ ...prev, [id]: v }));
  }, []);

  const toggleTech = useCallback((label: string) => {
    setSelectedTechs((prev) => {
      const n = new Set(prev);
      n.has(label) ? n.delete(label) : n.add(label);
      return n;
    });
  }, []);

  const toggleBadge = useCallback((id: string) => {
    setSelectedBadges((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const applyTemplate = useCallback((key: string) => {
    const t = TEMPLATES[key];
    if (!t) return;
    setFormData((prev) => ({
      ...prev,
      projName: t.name,
      tagline: t.tag,
      description: t.desc,
      features: t.features,
      installCmds: t.installCmds ?? prev.installCmds,
      ...(t.abstractText && { abstractText: t.abstractText }),
      ...(t.methodology && { methodology: t.methodology }),
      ...(t.paperLink && { paperLink: t.paperLink }),
      ...(t.datasetLink && { datasetLink: t.datasetLink }),
      ...(t.bibtexCitation && { bibtexCitation: t.bibtexCitation }),
    }));
    setSelectedTechs(new Set(t.techs));
    setActiveTemplate(key);
    // If academic template, enable academic section
    if (key === 'academic') setSectionState((prev) => ({ ...prev, academic: true }));
    toast.success(`Template "${t.name}" applied!`);
  }, []);

  const handleAutoFill = useCallback((patch: Partial<FormData>, techs?: string[]) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    if (techs?.length)
      setSelectedTechs((prev) => {
        const n = new Set(prev);
        for (const t of techs) n.add(t);
        return n;
      });
  }, []);

  const handleReset = () => {
    if (!confirm('Reset all fields?')) return;
    setFormData(EMPTY_FORM);
    setSectionState(defaultSectionState());
    setSectionOrder(SECTION_DEFS.map((s) => s.id));
    setSelectedTechs(new Set());
    setSelectedBadges(new Set(DEFAULT_BADGES));
    setActiveTemplate(null);
    sessionStorage.removeItem(STORAGE_KEY);
    toast.success('Reset complete!');
  };

  const handleCopy = async () => {
    if (!currentMd) {
      toast.error('Nothing to copy yet!');
      return;
    }
    try {
      await navigator.clipboard.writeText(currentMd);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Could not access clipboard');
    }
  };

  const handleDownload = () => {
    if (!currentMd) {
      toast.error('Nothing to download yet!');
      return;
    }
    const blob = new Blob([currentMd], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${formData.projName || 'README'}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('README.md downloaded!');
  };

  const handlePrint = () => {
    if (!currentMd) {
      toast.error('Nothing to print yet!');
      return;
    }
    window.print();
  };

  const handleOpenInEditor = async () => {
    if (!currentMd) {
      toast.error('Generate some content first!');
      return;
    }
    setCreating(true);
    try {
      const title = formData.projName ? `${formData.projName}-README.md` : 'README.md';
      await createDocument(title, null, currentMd);
      sessionStorage.removeItem(STORAGE_KEY);
      toast.success(`"${title}" opened in editor`);
      router.push('/');
    } catch {
      toast.error('Failed to create document');
    } finally {
      setCreating(false);
    }
  };

  const activeSectionCount = Object.values(sectionState).filter(Boolean).length;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* ── Header ── */}
      <header className="h-13 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#0d1117]/90 backdrop-blur-md px-4 shrink-0 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Editor</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <div className="flex items-center gap-2 font-semibold text-sm">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">README Builder</span>
          </div>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full transition-all ${autoSaved ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'text-transparent'}`}
          >
            ✓ Auto-saved
          </span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {activeSectionCount}
          </span>{' '}
          sections active
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleReset}
            className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 px-2 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            aria-label="Reset all fields"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            disabled={!currentMd}
            className="text-xs h-8 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hidden sm:flex"
          >
            <Printer className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Print</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!currentMd}
            className="text-xs h-8 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FileDown className="h-3.5 w-3.5 sm:mr-1" />
            <span className="hidden sm:inline">Download .md</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!currentMd}
            className="text-xs h-8"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 sm:mr-1 text-emerald-500" />
            ) : (
              <ClipboardCopy className="h-3.5 w-3.5 sm:mr-1" />
            )}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy MD'}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleOpenInEditor}
            disabled={creating || !currentMd}
            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs shadow-emerald-500/20"
          >
            {creating ? (
              <Loader2 className="h-3.5 w-3.5 sm:mr-1 animate-spin" />
            ) : (
              <FolderOpen className="h-3.5 w-3.5 sm:mr-1" />
            )}
            <span className="hidden sm:inline">Open in Editor</span>
          </Button>
        </div>
      </header>

      {/* ── 3-panel body ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Sidebar */}
        <aside
          style={{ width: sidebarW }}
          className="shrink-0 border-r border-slate-200 dark:border-slate-800/80 flex flex-col overflow-hidden bg-slate-50/60 dark:bg-[#090d16]/70"
        >
          <Sidebar
            sectionState={sectionState}
            toggleSection={toggleSection}
            sectionOrder={sectionOrder}
            setSectionOrder={setSectionOrder}
            selectedTechs={selectedTechs}
            onApplyTemplate={applyTemplate}
            activeTemplate={activeTemplate}
            formData={formData}
            onFill={handleAutoFill}
          />
        </aside>

        {/* Resize handle: sidebar ↔ editor */}
        <div
          onMouseDown={handleSidebarResize}
          className="w-1 shrink-0 cursor-col-resize bg-slate-200 dark:bg-slate-800 hover:bg-blue-400 dark:hover:bg-blue-600 transition-colors active:bg-blue-500"
          title="Drag to resize sidebar"
        />

        {/* CENTER: Editor */}
        <main className="flex-1 overflow-hidden bg-white dark:bg-[#0d1117]">
          <EditorPanel
            formData={formData}
            updateField={updateField}
            sectionState={sectionState}
            sectionOrder={sectionOrder}
            selectedTechs={selectedTechs}
            toggleTech={toggleTech}
            selectedBadges={selectedBadges}
            toggleBadge={toggleBadge}
          />
        </main>

        {/* Resize handle: editor ↔ preview */}
        <div
          onMouseDown={handlePreviewResize}
          className="w-1 shrink-0 cursor-col-resize bg-slate-200 dark:bg-slate-800 hover:bg-blue-400 dark:hover:bg-blue-600 transition-colors active:bg-blue-500 hidden lg:block"
          title="Drag to resize preview"
        />

        {/* RIGHT: Preview */}
        <aside
          style={{ width: previewW }}
          className="shrink-0 border-l border-slate-200 dark:border-slate-800/80 flex flex-col overflow-hidden hidden lg:flex"
        >
          <PreviewPanel
            currentMd={currentMd}
            formData={formData}
            sectionState={sectionState}
            selectedTechs={selectedTechs}
          />
        </aside>
      </div>
    </div>
  );
}
