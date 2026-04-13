"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import CharacterCount from "@tiptap/extension-character-count";
import { useEffect, useCallback, type MutableRefObject, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { countWordsFromPlainText } from "@/lib/word-count";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Link2,
  Type,
} from "lucide-react";

type Props = {
  defaultValue?: string;
  onContentChange?: (html: string) => void;
  /** When set, always holds a function that returns the latest HTML (for reliable form submit). */
  htmlGetterRef?: MutableRefObject<(() => string) | null>;
  onEditorReady?: (ready: boolean) => void;
  placeholder?: string;
  statsMode?: "characters" | "words";
  maxWords?: number;
};

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${
        active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function BlogEditor({
  defaultValue = "",
  onContentChange,
  htmlGetterRef,
  onEditorReady,
  placeholder = "Write your story...",
  statsMode = "characters",
  maxWords,
}: Props) {
  /** Next.js SSR: TipTap requires `false` here; `true` throws at runtime. */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        blockquote: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      Placeholder.configure({ placeholder }),
      Blockquote.configure({
        HTMLAttributes: { class: "border-l-4 border-primary/50 pl-4 italic text-muted-foreground" },
      }),
      CodeBlock.configure({
        HTMLAttributes: { class: "rounded-lg bg-muted p-4 font-mono text-sm" },
      }),
      HorizontalRule,
      CharacterCount,
    ],
    content: defaultValue || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] w-full px-4 py-4 text-sm leading-relaxed outline-none prose prose-sm prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 max-w-none",
      },
    },
    immediatelyRender: false,
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    onEditorReady?.(true);
    const sync = () => {
      const html = editor.getHTML();
      onContentChange?.(html);
    };
    if (htmlGetterRef) {
      htmlGetterRef.current = () => editor.getHTML();
    }
    editor.on("update", sync);
    sync();
    return () => {
      onEditorReady?.(false);
      editor.off("update", sync);
      if (htmlGetterRef) {
        htmlGetterRef.current = null;
      }
    };
  }, [editor, onContentChange, htmlGetterRef, onEditorReady]);

  if (!editor) return null;

  const wordCount =
    statsMode === "words" ? countWordsFromPlainText(editor.getText()) : 0;
  const overWordLimit =
    statsMode === "words" && maxWords != null && wordCount > maxWords;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2 py-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline code"
        >
          <Code className="size-4" />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code block"
        >
          <Type className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Insert link">
          <Link2 className="size-4" />
        </ToolbarButton>
        <span
          className={cn(
            "ml-auto px-2 text-[10px] text-muted-foreground",
            overWordLimit && "font-medium text-destructive"
          )}
        >
          {statsMode === "words"
            ? maxWords != null
              ? `${wordCount} / ${maxWords} words`
              : `${wordCount} words`
            : typeof editor.storage.characterCount?.characters === "function"
              ? editor.storage.characterCount.characters()
              : ""}
        </span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
