import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "../candidate/InputResumeDetails";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    borderTopWidth: 4,
    borderTopColor: "#2563eb", 
  },
  container: {
    maxWidth: 800,
    marginHorizontal: "auto",
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: "light",
    color: "#1f2937", 
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 11,
    color: "#4b5563", 
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#2563eb", 
    marginBottom: 6,
  },
  summaryText: {
    fontSize: 11,
    color: "#374151", 
    lineHeight: 1.5,
  },
  experienceItem: {
    marginBottom: 12,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },
  jobDate: {
    fontSize: 10,
    color: "#4b5563",
  },
  employer: {
    fontSize: 11,
    color: "#374151",
    marginTop: 2,
  },
  jobDescription: {
    fontSize: 10,
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
    alignItems: "baseline",
  },
  degree: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1f2937",
  },
  eduDate: {
    fontSize: 10,
    color: "#4b5563",
  },
  school: {
    fontSize: 11,
    color: "#374151",
    marginTop: 2,
  },
  eduDescription: {
    fontSize: 10,
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
  skillPill: {
    backgroundColor: "#eff6ff", 
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 10,
    color: "#1e40af", 
  },
});

export const ProfessionalPDFTemplate: React.FC<{ data: ResumeData }> = ({
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
          {}
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

          {}
          {summary && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.summaryText}>{summary}</Text>
            </View>
          )}

          {}
          {experience && experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
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

          {}
          {education && education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
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

          {}
          {skills && skills.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>
              <View style={styles.skillsContainer}>
                {skills.map((skill, idx) => (
                  <View key={idx} style={styles.skillPill}>
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
