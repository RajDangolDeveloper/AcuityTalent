import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "../candidate/InputResumeDetails";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Times-Roman",
  },
  header: {
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    borderBottomStyle: "solid",
    paddingBottom: 12,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  contactInfo: {
    marginTop: 4,
    fontSize: 10,
    color: "#4b5563",
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 12,
  },
  summaryText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  jobDate: {
    fontSize: 9,
    color: "#6b7280",
    fontStyle: "italic",
  },
  employer: {
    fontSize: 10,
    color: "#374151",
    marginTop: 2,
  },
  jobDescription: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 4,
    lineHeight: 1.4,
  },
  educationItem: {
    marginBottom: 8,
  },
  educationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  degree: {
    fontSize: 11,
    fontWeight: "bold",
  },
  school: {
    fontSize: 10,
    color: "#374151",
    marginTop: 2,
  },
  educationDescription: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 2,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 8,
  },
  skillBadge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 9,
    color: "#1f2937",
  },
});

export const ClassicPDFTemplate: React.FC<{ data: ResumeData }> = ({
  data,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {}
        <View style={styles.header}>
          <Text style={styles.name}>{data.fullName}</Text>
          <View style={styles.contactInfo}>
            <Text>{data.email}</Text>
            {data.phone && <Text> | {data.phone}</Text>}
            {(data.city || data.country) && (
              <Text>
                {" "}
                | {[data.city, data.country].filter(Boolean).join(", ")}
              </Text>
            )}
          </View>
        </View>

        {}
        {data.summary && (
          <View>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summaryText}>{data.summary}</Text>
          </View>
        )}

        {}
        {data.experience && data.experience.length > 0 && (
          <View>
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

        {}
        {data.education && data.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, idx) => (
              <View key={idx} style={styles.educationItem}>
                <View style={styles.educationHeader}>
                  <Text style={styles.degree}>{edu.degree}</Text>
                  <Text style={styles.jobDate}>
                    {edu.start} – {edu.end}
                  </Text>
                </View>
                <Text style={styles.school}>
                  {edu.school}
                  {edu.city && `, ${edu.city}`}
                </Text>
                {edu.description && (
                  <Text style={styles.educationDescription}>
                    {edu.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {}
        {data.skills && data.skills.length > 0 && (
          <View>
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
      </Page>
    </Document>
  );
};
