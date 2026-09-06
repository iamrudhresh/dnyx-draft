# State Management Guide

The application uses **Zustand** stores for modular, reactive state:
- `useWorkspaceStore`: Active document ID, document array, folder hierarchy, open tabs, search filter, and active view mode (`split`, `editor`, `preview`).
- `useSettingsStore`: Editor font size, font family, line numbers, word wrapping, and color theme.
