import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "../candidate/InputResumeDetails";

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  container: {
    maxWidth: 700,
    marginHorizontal: "auto",
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  name: {
    fontSize: 28,
    fontWeight: "light",
    color: "#1f2937",
    fontFamily: "Helvetica-Light",
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    fontSize: 11,
    color: "#6b7280",
    flexWrap: "wrap",
  },
  contactItem: {
    // used for spacing between items
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#9ca3af",
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 11,
    color: "#374151",
    lineHeight: 1.6,
    marginBottom: 4,
  },
  experienceItem: {
    marginBottom: 16,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: "medium",
    color: "#1f2937",
  },
  jobDate: {
    fontSize: 10,
    color: "#6b7280",
  },
  employer: {
    fontSize: 11,
    color: "#4b5563",
    marginBottom: 4,
  },
  jobDescription: {
    fontSize: 10,
    color: "#6b7280",
    lineHeight: 1.5,
  },
  educationItem: {
    marginBottom: 8,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  degree: {
    fontSize: 11,
    fontWeight: "medium",
    color: "#1f2937",
  },
  eduDate: {
    fontSize: 10,
    color: "#6b7280",
  },
  school: {
    fontSize: 10,
    color: "#4b5563",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillBadge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    color: "#374151",
  },
});

export const CleanPDFTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.name}>{data.fullName}</Text>
            <View style={styles.contactRow}>
              {data.email && <Text>{data.email}</Text>}
              {data.phone && <Text>{data.phone}</Text>}
              {(data.city || data.country) && (
                <Text>
                  {[data.city, data.country].filter(Boolean).join(", ")}
                </Text>
              )}
            </View>
          </View>

          {/* Professional Summary */}
          {data.summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.summaryText}>{data.summary}</Text>
            </View>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              {data.experience.map((job, idx) => (
                <View key={idx} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobDate}>
                      {job.start} – {job.end}
                    </Text>
                  </View>
                  <Text style={styles.employer}>
                    {job.employer}
                    {job.city && `, ${job.city}`}
                  </Text>
                  <Text style={styles.jobDescription}>{job.description}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {data.education.map((edu, idx) => (
                <View key={idx} style={styles.educationItem}>
                  <View style={styles.educationHeader}>
                    <Text style={styles.degree}>{edu.degree}</Text>
                    <Text style={styles.eduDate}>
                      {edu.start} – {edu.end}
                    </Text>
                  </View>
                  <Text style={styles.school}>
                    {edu.school}
                    {edu.city && `, ${edu.city}`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {data.skills.map((skill, idx) => (
                  <View key={idx} style={styles.skillBadge}>
                    <Text>{skill.skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
