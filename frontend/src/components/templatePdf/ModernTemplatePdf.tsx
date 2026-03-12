import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "../candidate/InputResumeDetails";

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  sidebar: {
    width: "33.33%",
    backgroundColor: "#4f46e5", // indigo-600 (a bit darker than indigo-700 to match)
    padding: 16,
    color: "#ffffff",
  },
  main: {
    width: "66.66%",
    padding: 16,
    backgroundColor: "#ffffff",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    fontSize: 10,
  },
  contactIcon: {
    width: 16,
    marginRight: 6,
    textAlign: "center",
  },
  contactText: {
    fontSize: 10,
  },
  sectionTitleSidebar: {
    fontSize: 14,
    fontWeight: "semibold",
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 0, // no border in sidebar
  },
  skillItem: {
    marginBottom: 8,
  },
  skillName: {
    fontSize: 10,
    marginBottom: 2,
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "#818cf8", // indigo-400
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    backgroundColor: "#ffffff",
    borderRadius: 3,
  },
  sectionTitleMain: {
    fontSize: 16,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 4,
    marginBottom: 10,
    marginTop: 8,
  },
  summaryText: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
    marginBottom: 8,
  },
  experienceItem: {
    marginBottom: 12,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginTop: 2,
  },
  jobDescription: {
    fontSize: 9,
    color: "#6b7280",
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
    marginTop: 2,
  },
  eduDescription: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
});

export const ModernPDFTemplate: React.FC<{ data: ResumeData }> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.name}>{data.fullName}</Text>

          {/* Contact info */}
          <View>
            {data.email && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>📧</Text>
                <Text style={styles.contactText}>{data.email}</Text>
              </View>
            )}
            {data.phone && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>📞</Text>
                <Text style={styles.contactText}>{data.phone}</Text>
              </View>
            )}
            {(data.city || data.country) && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>📍</Text>
                <Text style={styles.contactText}>
                  {[data.city, data.country].filter(Boolean).join(", ")}
                </Text>
              </View>
            )}
            {data.nationality && (
              <View style={styles.contactItem}>
                <Text style={styles.contactIcon}>🌍</Text>
                <Text style={styles.contactText}>{data.nationality}</Text>
              </View>
            )}
          </View>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <View>
              <Text style={[styles.sectionTitleSidebar, { marginTop: 24 }]}>
                Skills
              </Text>
              {data.skills.map((skill, i) => (
                <View key={i} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.skill}</Text>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${(skill.level || 0) * 10}%` },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          {data.summary && (
            <View>
              <Text style={styles.sectionTitleMain}>Professional Summary</Text>
              <Text style={styles.summaryText}>{data.summary}</Text>
            </View>
          )}

          {data.experience && data.experience.length > 0 && (
            <View>
              <Text style={styles.sectionTitleMain}>Experience</Text>
              {data.experience.map((job, idx) => (
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

          {data.education && data.education.length > 0 && (
            <View>
              <Text style={styles.sectionTitleMain}>Education</Text>
              {data.education.map((edu, idx) => (
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
        </View>
      </Page>
    </Document>
  );
};
