import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Path,
  Svg,
} from "@react-pdf/renderer";
import { ResumeData } from "../candidate/InputResumeDetails";
import { icons } from "lucide-react";

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

const EmailIcon = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24">
    <Path
      d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
      fill="white"
    />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24">
    <Path
      d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
      fill="white"
    />
  </Svg>
);

const LocationIcon = () => (
  <Svg width="10" height="10" viewBox="0 0 24 24">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
      fill="white"
    />
  </Svg>
);

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
                <EmailIcon />
                <Text style={styles.contactText}>{data.email}</Text>
              </View>
            )}
            {data.phone && (
              <View style={styles.contactItem}>
                <PhoneIcon />
                <Text style={styles.contactText}>{data.phone}</Text>
              </View>
            )}
            {(data.city || data.country) && (
              <View style={styles.contactItem}>
                <LocationIcon />
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
