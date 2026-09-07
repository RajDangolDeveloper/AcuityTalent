import DOMPurify from "dompurify";

interface CustomMarkdownProps {
  content: string;
}

export function CustomMarkdown({ content }: CustomMarkdownProps) {
  const cleanHtml = DOMPurify.sanitize(content || "");

  return (
    <>
      <div
        className="rich-text-content text-wrap"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
      <style jsx global>{`
        .rich-text-content {
          max-width: 100%;
          overflow-wrap: break-word;
          text-wrap: wrap;
        }

        .rich-text-content * {
          max-width: 100%;
        }

        .rich-text-content pre {
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-x: auto;
        }

        .rich-text-content p {
          margin: 0 0 0.75rem;
        }
        .rich-text-content p:empty {
          min-height: 1.2em;
        }
        .rich-text-content ul,
        .rich-text-content ol {
          padding-left: 1.25rem;
          margin: 0 0 0.75rem;
        }
      `}</style>
    </>
  );
}
