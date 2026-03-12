import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "../candidate/InputResumeDetails";

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  container: {
    maxWidth: 700,
    marginHorizontal: "auto",
  },
  header: {
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  contact: {
    fontSize: 10,
    color: "#374151",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contactSeparator: {
    marginHorizontal: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    paddingBottom: 3,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#1f2937",
  },
  experienceItem: {
    marginBottom: 12,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: "bold",
  },
  jobDate: {
    fontSize: 9,
    color: "#4b5563",
  },
  employer: {
    fontSize: 10,
    color: "#374151",
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
  eduHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  degree: {
    fontSize: 11,
    fontWeight: "bold",
  },
  eduDate: {
    fontSize: 9,
    color: "#4b5563",
  },
  school: {
    fontSize: 10,
    color: "#374151",
  },
  eduDescription: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 2,
    lineHeight: 1.4,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  skillItem: {
    fontSize: 10,
    color: "#1f2937",
  },
});

export const PrimeATSPDFTemplate: React.FC<{ data: ResumeData }> = ({
  data,
}) => {
  const skills = data.skills;
  const experience = data.experience;
  const education = data.education;
  const summary = data.summary;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header (unchanged) */}
          <View style={styles.header}>
            <Text style={styles.name}>{data.fullName}</Text>
            <View style={styles.contact}>
              <Text>{data.email}</Text>
              <Text style={styles.contactSeparator}>|</Text>
              <Text>{data.phone}</Text>
              <Text style={styles.contactSeparator}>|</Text>
              <Text>
                {[data.city, data.country].filter(Boolean).join(", ")}
              </Text>
            </View>
          </View>

          {/* Summary */}
          {summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SUMMARY</Text>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          )}

          {/* Experience */}
          {experience && experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EXPERIENCE</Text>
              {experience.map((job, idx) => (
                <View key={idx} style={styles.experienceItem}>
                  <View style={styles.expHeader}>
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
          {education && education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EDUCATION</Text>
              {education.map((edu, idx) => (
                <View key={idx} style={styles.educationItem}>
                  <View style={styles.eduHeader}>
                    <Text style={styles.degree}>{edu.degree}</Text>
                    <Text style={styles.eduDate}>
                      {edu.start} – {edu.end}
                    </Text>
                  </View>
                  <Text style={styles.school}>
                    {edu.school}
                    {edu.city && `, ${edu.city}`}
                  </Text>
                  {edu.description && (
                    <Text style={styles.eduDescription}>{edu.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {skills && skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SKILLS</Text>
              <View style={styles.skillsContainer}>
                {skills.map((skill, idx) => (
                  <Text key={idx} style={styles.skillItem}>
                    {skill.skill}
                    {idx < skills.length - 1 && ", "}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};
