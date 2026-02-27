import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useEffect } from "react";
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange?: (html: string) => void;
  readOnly?: boolean;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  readOnly = false,
  minHeight = "300px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  const btn = (active: boolean) =>
    `p-1.5 rounded transition-colors ${
      active
        ? "bg-blue-100 text-blue-700"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {!readOnly && (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
            className={btn(editor.isActive("bold"))}
            title="Gras"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
            className={btn(editor.isActive("italic"))}
            title="Italique"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleUnderline().run(); }}
            className={btn(editor.isActive("underline"))}
            title="Souligné"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="w-px bg-gray-300 mx-1" />

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); }}
            className={btn(editor.isActive("heading", { level: 1 }))}
            title="Titre 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); }}
            className={btn(editor.isActive("heading", { level: 2 }))}
            title="Titre 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-px bg-gray-300 mx-1" />

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
            className={btn(editor.isActive("bulletList"))}
            title="Liste à puces"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
            className={btn(editor.isActive("orderedList"))}
            title="Liste numérotée"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px bg-gray-300 mx-1" />

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("left").run(); }}
            className={btn(editor.isActive({ textAlign: "left" }))}
            title="Aligner à gauche"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("center").run(); }}
            className={btn(editor.isActive({ textAlign: "center" }))}
            title="Centrer"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setTextAlign("right").run(); }}
            className={btn(editor.isActive({ textAlign: "right" }))}
            title="Aligner à droite"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 focus:outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
