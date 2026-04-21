from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, ARRAY, Boolean
from sqlalchemy.orm import relationship
from database.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "User"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    firstName = Column(String, nullable=True)
    lastName = Column(String, nullable=True)
    role = Column(String, default="CANDIDATE")
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    candidate = relationship("CandidateProfile", back_populates="user", uselist=False)

class CandidateProfile(Base):
    __tablename__ = "CandidateProfile"
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("User.id"), nullable=False)
    headline = Column(String, nullable=True)
    currentPosition = Column(String, nullable=True)
    experienceYears = Column(Integer, nullable=True)
    skills = Column(ARRAY(String), nullable=True, default=[])
    preferredLocation = Column(String, nullable=True)
    expectedSalary = Column(Float, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="candidate")
    embedding = relationship("CandidateProfileEmbedding", back_populates="candidate", uselist=False)

class CandidateProfileEmbedding(Base):
    __tablename__ = "CandidateProfileEmbedding"
    id = Column(Integer, primary_key=True)
    candidateProfileId = Column(Integer, ForeignKey("CandidateProfile.id", ondelete="CASCADE"), unique=True)

    embedding = Column(Vector(768), nullable=True)
    model = Column(String, default="all-mpnet-base-v2")
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    candidate = relationship("CandidateProfile", back_populates="embedding")

class Job(Base):
    __tablename__ = "Job"
    id = Column(Integer, primary_key=True, index=True)
    companyId = Column(Integer, nullable=False)
    recruiterId = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    requirements = Column(Text, nullable=True)
    employmentType = Column(String, nullable=True)
    experienceLevel = Column(String, nullable=True)
    salaryRange = Column(String, nullable=True)
    location = Column(String, nullable=True)
    locationType = Column(String, nullable=True)
    remoteAvailable = Column(Boolean, default=False)
    status = Column(String, default="DRAFT")
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    embedding = relationship("JobEmbedding", back_populates="job", uselist=False)

class JobEmbedding(Base):
    __tablename__ = "JobEmbedding"
    id = Column(Integer, primary_key=True)
    jobId = Column(Integer, ForeignKey("Job.id", ondelete="CASCADE"), unique=True)
    embedding = Column(Vector(768), nullable=True)
    model = Column(String, default="all-mpnet-base-v2")
    createdAt = Column(DateTime, default=datetime.utcnow)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    job = relationship("Job", back_populates="embedding")