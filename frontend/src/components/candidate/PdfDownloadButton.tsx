"use client";

import dynamic from "next/dynamic";
import { ReactNode } from "react";

const ClientPDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink as any),
  { ssr: false },
);

type PdfDownloadButtonProps = {
  document: React.ReactElement;
  fileName: string;
  className?: string;
  children: ReactNode | ((props: any) => ReactNode);
};

export default function PdfDownloadButton({
  document,
  fileName,
  className,
  children,
}: PdfDownloadButtonProps) {
  return (
    <ClientPDFDownloadLink
      document={document}
      fileName={fileName}
      className={className}
    >
      {children}
    </ClientPDFDownloadLink>
  );
}
