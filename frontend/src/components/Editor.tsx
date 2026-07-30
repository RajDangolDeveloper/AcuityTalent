"use client";

import ReactQuill from "react-quill-new";

interface ReactEditorProps {
  placeholder?: string;
  value?: string;
  onChange?: (content: string) => void;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, false] }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["link", "image"],
  ],
};

const formats = [
  "header",
  "bold",
  "color",
  "background",
  "italic",
  "underline",
  "blockquote",
  "code-block",
  "list",
  "bullet",
  "align",
  "size",
  "link",
  "image",
];

export default function ReactEditor({
  placeholder,
  value,
  onChange,
}: ReactEditorProps) {
  return (
    <>
      <ReactQuill
        theme="snow"
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          height: "320px",
          width: "100%",
          maxWidth: "100%",
        }}
      />
      <style jsx global>{`
        .ql-toolbar,
        .ql-container {
          overflow: hidden;
        }

        .ql-container {
          min-height: 240px;
          height: calc(100% - 42px);
        }

        .ql-editor {
          min-height: 240px;
          font-size: 0.95rem;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
