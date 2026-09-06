'use client';

import { Search } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DiagramTemplate {
  id: string;
  category: string;
  name: string;
  engine: string;
  description: string;
  template: string;
}

const DIAGRAM_TEMPLATES: DiagramTemplate[] = [
  // Mermaid
  {
    id: 'mermaid-flowchart',
    category: 'Mermaid',
    name: 'Flowchart',
    engine: 'mermaid',
    description: 'Directional flowchart with decisions',
    template: `\n\n\`\`\`mermaid\nflowchart TD\n    A[Start] --> B{Decision?}\n    B -->|Yes| C[Process A]\n    B -->|No| D[Process B]\n    C --> E[End]\n    D --> E\n\`\`\`\n`,
  },
  {
    id: 'mermaid-sequence',
    category: 'Mermaid',
    name: 'Sequence Diagram',
    engine: 'mermaid',
    description: 'Message flow between actors',
    template: `\n\n\`\`\`mermaid\nsequenceDiagram\n    participant Alice\n    participant Bob\n    Alice->>Bob: Hello Bob!\n    Bob-->>Alice: Hi Alice!\n    Alice->>Bob: How are you?\n    Bob-->>Alice: Great, thanks!\n\`\`\`\n`,
  },
  {
    id: 'mermaid-class',
    category: 'Mermaid',
    name: 'Class Diagram',
    engine: 'mermaid',
    description: 'UML class relationships',
    template: `\n\n\`\`\`mermaid\nclassDiagram\n    Animal <|-- Duck\n    Animal <|-- Fish\n    class Animal{\n        +String name\n        +makeSound()\n    }\n    class Duck{\n        +String color\n        +quack()\n    }\n\`\`\`\n`,
  },
  {
    id: 'mermaid-er',
    category: 'Mermaid',
    name: 'ER Diagram',
    engine: 'mermaid',
    description: 'Entity relationship diagram',
    template: `\n\n\`\`\`mermaid\nerDiagram\n    CUSTOMER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains\n    CUSTOMER {\n        string name\n        string email\n    }\n    ORDER {\n        int id\n        date placed\n    }\n\`\`\`\n`,
  },
  {
    id: 'mermaid-gantt',
    category: 'Mermaid',
    name: 'Gantt Chart',
    engine: 'mermaid',
    description: 'Project timeline',
    template: `\n\n\`\`\`mermaid\ngantt\n    title Project Timeline\n    dateFormat  YYYY-MM-DD\n    section Planning\n    Research :a1, 2024-01-01, 7d\n    Design   :a2, after a1, 5d\n    section Development\n    Coding   :b1, after a2, 14d\n    Testing  :b2, after b1, 7d\n\`\`\`\n`,
  },
  {
    id: 'mermaid-pie',
    category: 'Mermaid',
    name: 'Pie Chart',
    engine: 'mermaid',
    description: 'Proportional data chart',
    template: `\n\n\`\`\`mermaid\npie title Market Share\n    "Product A" : 45\n    "Product B" : 30\n    "Product C" : 25\n\`\`\`\n`,
  },
  {
    id: 'mermaid-mindmap',
    category: 'Mermaid',
    name: 'Mind Map',
    engine: 'mermaid',
    description: 'Hierarchical mind map',
    template: `\n\n\`\`\`mermaid\nmindmap\n  root((Central Idea))\n    Branch A\n      Leaf A1\n      Leaf A2\n    Branch B\n      Leaf B1\n        Sub-leaf\n    Branch C\n\`\`\`\n`,
  },
  // Markmap
  {
    id: 'markmap-basic',
    category: 'Markmap',
    name: 'Markmap Tree',
    engine: 'markmap',
    description: 'Interactive mind map from Markdown',
    template: `\n\n\`\`\`markmap\n# Central Topic\n## Branch 1\n- Item 1.1\n- Item 1.2\n  - Sub-item\n## Branch 2\n- Item 2.1\n- Item 2.2\n## Branch 3\n- Item 3.1\n\`\`\`\n`,
  },
  // PlantUML
  {
    id: 'plantuml-sequence',
    category: 'PlantUML',
    name: 'Sequence',
    engine: 'plantuml',
    description: 'PlantUML sequence diagram',
    template: `\n\n\`\`\`plantuml\n@startuml\nAlice -> Bob: Hello\nBob --> Alice: Hi there!\nAlice -> Bob: How are you?\nBob --> Alice: Fine, thanks!\n@enduml\n\`\`\`\n`,
  },
  {
    id: 'plantuml-class',
    category: 'PlantUML',
    name: 'Class Diagram',
    engine: 'plantuml',
    description: 'PlantUML class diagram',
    template: `\n\n\`\`\`plantuml\n@startuml\nclass Animal {\n  +name: String\n  +makeSound()\n}\nclass Dog extends Animal {\n  +breed: String\n  +bark()\n}\n@enduml\n\`\`\`\n`,
  },
  // Graphviz / DOT
  {
    id: 'graphviz-graph',
    category: 'Graphviz',
    name: 'Directed Graph',
    engine: 'dot',
    description: 'DOT language graph',
    template: `\n\n\`\`\`dot\ndigraph G {\n  rankdir=LR;\n  A -> B;\n  A -> C;\n  B -> D;\n  C -> D;\n  D -> E;\n}\n\`\`\`\n`,
  },
  // D2
  {
    id: 'd2-basic',
    category: 'D2',
    name: 'D2 Diagram',
    engine: 'd2',
    description: 'Modern diagram language',
    template: `\n\n\`\`\`d2\ndirection: right\nServer -> Database: queries\nClient -> Server: requests\nServer -> Client: responses\n\`\`\`\n`,
  },
  // WaveDrom
  {
    id: 'wavedrom-timing',
    category: 'WaveDrom',
    name: 'Timing Diagram',
    engine: 'wavedrom',
    description: 'Digital waveform timing diagram',
    template: `\n\n\`\`\`wavedrom\n{ signal: [\n  { name: "clk",  wave: "p.....|..." },\n  { name: "data", wave: "x.345x|=.x", data: ["A","B","C","D"] },\n  { name: "req",  wave: "0.1..0|1.0" },\n  {                              },\n  { name: "ack",  wave: "1.....|01." }\n]}\n\`\`\`\n`,
  },
  // Vega-Lite
  {
    id: 'vegalite-bar',
    category: 'Vega-Lite',
    name: 'Bar Chart',
    engine: 'vega-lite',
    description: 'Interactive bar chart',
    template: `\n\n\`\`\`vega-lite\n{\n  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",\n  "data": {"values": [\n    {"category": "A", "value": 28},\n    {"category": "B", "value": 55},\n    {"category": "C", "value": 43}\n  ]},\n  "mark": "bar",\n  "encoding": {\n    "x": {"field": "category", "type": "nominal"},\n    "y": {"field": "value", "type": "quantitative"}\n  }\n}\n\`\`\`\n`,
  },
  {
    id: 'vegalite-line',
    category: 'Vega-Lite',
    name: 'Line Chart',
    engine: 'vega-lite',
    description: 'Line chart over time',
    template: `\n\n\`\`\`vega-lite\n{\n  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",\n  "data": {"values": [\n    {"x": 1, "y": 4},\n    {"x": 2, "y": 7},\n    {"x": 3, "y": 2},\n    {"x": 4, "y": 9},\n    {"x": 5, "y": 5}\n  ]},\n  "mark": "line",\n  "encoding": {\n    "x": {"field": "x", "type": "quantitative"},\n    "y": {"field": "y", "type": "quantitative"}\n  }\n}\n\`\`\`\n`,
  },
  // ABC
  {
    id: 'abc-melody',
    category: 'Music',
    name: 'ABC Melody',
    engine: 'abc',
    description: 'Music notation with playback',
    template: `\n\n\`\`\`abc\nX:1\nT:Simple Melody\nM:4/4\nL:1/4\nK:C\nC D E F | G A B c | c B A G | F E D C |\n\`\`\`\n`,
  },
  // GeoJSON
  {
    id: 'geojson-point',
    category: 'Maps',
    name: 'GeoJSON Point',
    engine: 'geojson',
    description: 'Geographic point on a map',
    template: `\n\n\`\`\`geojson\n{\n  "type": "FeatureCollection",\n  "features": [{\n    "type": "Feature",\n    "geometry": {\n      "type": "Point",\n      "coordinates": [77.5946, 12.9716]\n    },\n    "properties": { "name": "Bangalore" }\n  }]\n}\n\`\`\`\n`,
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(DIAGRAM_TEMPLATES.map((t) => t.category)))];

interface InsertDiagramModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (template: string) => void;
}

export const InsertDiagramModal: React.FC<InsertDiagramModalProps> = ({
  open,
  onOpenChange,
  onInsert,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return DIAGRAM_TEMPLATES.filter((t) => {
      const matchesSearch =
        !search ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.engine.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === 'All' || t.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-200 dark:border-slate-800">
          <DialogTitle className="text-base">Insert Diagram</DialogTitle>
        </DialogHeader>

        {/* Search + category filter */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search diagrams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090d16] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">
              No diagrams match your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filtered.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    onInsert(tmpl.template);
                    onOpenChange(false);
                  }}
                  className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                      {tmpl.engine}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {tmpl.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
