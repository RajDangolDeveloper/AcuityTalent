"use client";

import dynamic from "next/dynamic";
import type { PDFDownloadLinkProps } from "@react-pdf/renderer";

const ClientPDFDownloadLink = dynamic<PDFDownloadLinkProps>(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false },
);

export default function PdfDownloadButton(props: PDFDownloadLinkProps) {
  return <ClientPDFDownloadLink {...props} />;
}
