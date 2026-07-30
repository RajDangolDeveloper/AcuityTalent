import DOMPurify from "dompurify";

interface CustomMarkdownProps {
  content: string;
}

export function CustomMarkdown({ content }: CustomMarkdownProps) {
  const cleanHtml = DOMPurify.sanitize(content || "");

  return (
    <>
      <div
        className="rich-text-content"
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
      <style jsx global>{`
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
