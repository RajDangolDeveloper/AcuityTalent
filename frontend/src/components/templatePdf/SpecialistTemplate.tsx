import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ResumeData } from "../candidate/InputResumeDetails";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    borderLeftWidth: 8,
    borderLeftColor: "#16a34a", // green-600
  },
  container: {
    maxWidth: 800,
    marginHorizontal: "auto",
  },
  row: {
    flexDirection: "row",
    gap: 20,
  },
  leftColumn: {
    width: "33.33%",
  },
  rightColumn: {
    width: "66.66%",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937", // gray-800
    marginBottom: 4,
  },
  contactInfo: {
    marginBottom: 16,
  },
  contactLine: {
    fontSize: 10,
    color: "#4b5563", // gray-600
    marginBottom: 2,
  },
  sectionTitleLeft: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#16a34a", // green-700 (original used green-700)
    marginBottom: 8,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  skillBadge: {
    backgroundColor: "#dcfce7", // green-100
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "medium",
    color: "#166534", // green-800
  },
  sectionTitleRight: {
    fontSize: 16,
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#16a34a", // green-600
    paddingBottom: 2,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 10,
    color: "#374151", // gray-700
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
    color: "#1f2937",
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
  },
  degree: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1f2937",
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
});

export const SpecialistPDFTemplate: React.FC<{ data: ResumeData }> = ({
  data,
}) => {
  // Extract optional fields to local constants for type safety
  const skills = data.skills;
  const experience = data.experience;
  const education = data.education;
  const summary = data.summary;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <View style={styles.row}>
            {/* Left Column */}
            <View style={styles.leftColumn}>
              <Text style={styles.name}>{data.fullName}</Text>
              <View style={styles.contactInfo}>
                {data.email && (
                  <Text style={styles.contactLine}>{data.email}</Text>
                )}
                {data.phone && (
                  <Text style={styles.contactLine}>{data.phone}</Text>
                )}
                {(data.city || data.country) && (
                  <Text style={styles.contactLine}>
                    {[data.city, data.country].filter(Boolean).join(", ")}
                  </Text>
                )}
              </View>

              {skills && skills.length > 0 && (
                <View>
                  <Text style={styles.sectionTitleLeft}>Core Skills</Text>
                  <View style={styles.skillsContainer}>
                    {skills.map((skill, idx) => (
                      <View key={idx} style={styles.skillBadge}>
                        <Text>{skill.skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Right Column */}
            <View style={styles.rightColumn}>
              {summary && (
                <View>
                  <Text style={styles.sectionTitleRight}>Profile</Text>
                  <Text style={styles.summaryText}>{summary}</Text>
                </View>
              )}

              {experience && experience.length > 0 && (
                <View>
                  <Text style={styles.sectionTitleRight}>Experience</Text>
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
                      <Text style={styles.jobDescription}>
                        {job.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {education && education.length > 0 && (
                <View>
                  <Text style={styles.sectionTitleRight}>Education</Text>
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
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
