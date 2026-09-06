# Markdown Rendering Pipeline

```
Markdown Text ──> remarkGfm ──> remarkMath ──> rehypeKatex ──> rehypeRaw ──> Custom Code Block Transformer (Mermaid.js)
```

1. **GitHub Flavored Markdown**: Tables, task lists, strikethrough, autolinks.
2. **Math**: KaTeX LaTeX formulas rendered via `rehype-katex`.
3. **Diagrams**: Mermaid sequence, state, class, and entity diagrams rendered dynamically via `MermaidViewer`.
