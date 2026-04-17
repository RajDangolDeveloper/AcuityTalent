from typing import List

from pydantic import BaseModel, Field, validator

class MatchRequest(BaseModel):
    resume_text: str = Field(
        ..., 
        description="The full text extracted from the candidate's resume",
        min_length=10
    )
    job_description: str = Field(
        ..., 
        description="The full text of the job posting",
        min_length=10
    )

    @validator('resume_text', 'job_description')
    def text_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Text content cannot be just whitespace')
        return v

class MatchResponse(BaseModel):
    similarity_score: float = Field(
        ...,
        description="Similarity percentage between 0 and 100",
        example=82.45,
    )
    status: str = Field(default="success")

    class Config:
        schema_extra = {
            "example": {
                "similarity_score": 82.45,
                "status": "success"
            }
        }

class CategorisationRequest(BaseModel):
    resume_text: str = Field(
        ..., 
        description="The full text extracted from the candidate's resume",
        min_length=10
    )
    job_description: str = Field(
        ..., 
        description="The full text of the job posting",
        min_length=10
    )

    @validator('resume_text', 'job_description')
    def text_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Text content cannot be just whitespace')
        return v

class CategorisationResponse(BaseModel):
    similarity_score: float = Field(
        ...,
        description="Similarity percentage between 0 and 100",
        example=82.45,
    )
    status: str = Field(default="success")

    class Config:
        schema_extra = {
            "example": {
                "similarity_score": 82.45,
                "status": "success"
            }
        }

class ScoreRequest(BaseModel):
    resume_text: str = Field(
        ..., 
        description="The full text extracted from the candidate's resume",
        min_length=10
    )
    job_description: str = Field(
        ..., 
        description="The full text of the job posting",
        min_length=10
    )

    @validator('resume_text', 'job_description')
    def text_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Text content cannot be just whitespace')
        return v


class ScoreResponse(BaseModel):
    resume_score: float = Field(
        ...,
        description="Similarity percentage between 0 and 100",
        example=82.45,
    )
    status: str = Field(default="success")

    class Config:
        schema_extra = {
            "example": {
                "similarity_score": 82.45,
                "status": "success"
            }
        }

class ReviewRequest(BaseModel):
    resume_text: str = Field(
        ..., 
        description="The full text extracted from the candidate's resume",
        min_length=10
    )
        
    @validator('resume_text')
    def text_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Text content cannot be just whitespace')
        return v


class ReviewResponse(BaseModel):
    summary: str = Field(
        ...,
        description="Text about the resume",
        example=" Summary Good This resume has strong content and structure, but some areas could benefit from further refinement. StrengthsYou effectively outlined your responsibilities and achievements in your work experience, showcasing impactful contributions — work experience section.Your academic projects highlight practical skills and technologies, demonstrating your hands-on experience — education section.You included a variety of relevant technologies that align with industry standards, showcasing your technical proficiency — education section.Your use of action-oriented language creates a dynamic and engaging narrative — overall.Make these changesAdd a summary or objective statement — this will provide a clearer overview of your career goals and key skills.Consider incorporating quantified achievements — metrics can enhance the impact of your contributions and demonstrate success.Refine the formatting for consistency, especially with bullet points and spacing — this improves readability and professionalism.Ensure consistent use of tense across your experience — present tense for current roles, past tense for previous roles enhances clarity.Add contact information at the top — this is critical for potential employers to reach you.Quick tipsTailor your resume for each job application — customizing your skills and experience to match the job description can improve your chances.Include a LinkedIn profile link — this allows potential employers to view your professional network and endorsements. Keep your technical skills updated — ensure you are highlighting the most in-demand technologies relevant to your field.",
    )
    strength: str = Field(
        ...,
        description="Text about the resume",
        example="",
    )
    changes: str = Field(
        ...,
        description="Text about the resume",
        example=" ",
    )
    tips: str = Field(
        ...,
        description="Text about the resume",
        example=" ",
    )
    status: str = Field(default="success")

    class Config:
        schema_extra = {
            "example": {
                "summary": "This is a summary",
                "strength": "This is a strength",
                "changes": "This is a changes",
                "tips": "This is a tip",
                "status": "success"
            }
        }


class CoverLetterRequest(BaseModel):
    resume_text: str = Field(
        ...,
        description="The full text extracted from the candidate's resume",
        min_length=10,
    )
    job_description: str = Field(
        ...,
        description="The full text of the job posting",
        min_length=10,
    )

    @validator("resume_text", "job_description")
    def cover_letter_text_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Text content cannot be just whitespace")
        return v


class CoverLetterResponse(BaseModel):
    cover_letter: str = Field(
        ...,
        description="The generated professional cover letter text",
    )
    status: str = Field(default="success")


class RewriteRequest(BaseModel):
    text: str = Field(
        ...,
        description="The original text to be improved",
        min_length=5,
    )
    topic: str | None = Field(
        default=None,
        description="Optional topic or role context to guide the rewrite",
    )

    @validator("text")
    def rewrite_text_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Text content cannot be just whitespace")
        return v


class RewriteResponse(BaseModel):
    improved_text: str = Field(
        ...,
        description="The improved version of the original text",
    )
    status: str = Field(default="success")


class JobRecommendationResponse(BaseModel):
    user_id: int = Field(..., description="ID of the user/candidate")
    recommended_job_ids: List[int] = Field(..., description="List of recommended job IDs")


class RecommendedJobItem(BaseModel):
    job_id: int = Field(..., description="ID of the job")
    title: str = Field(..., description="Job title")
    location: str = Field(..., description="Job location")
    employment_type: str = Field(..., description="Employment type (FULL_TIME, PART_TIME, etc)")
    match_score: float = Field(..., description="Match score as percentage (0-100)")


class JobRecommendationsListResponse(BaseModel):
    recommendations: List[RecommendedJobItem] = Field(..., description="List of recommended jobs with scores")
    total_count: int = Field(..., description="Total number of recommendations")
    status: str = Field(default="success")

class EmbeddingRequest(BaseModel):
    text: str = Field(
        text="The text needed to create embeddings",
    )

class EmbeddingResponse(BaseModel):
    embedding: List[float] = Field(..., description="The generated embedding vector")
    status: str = Field(default="success")


class InterviewRiskItem(BaseModel):
    status: str = Field(..., description="Interview status, e.g. NO_SHOW")


class WorkHistoryRiskItem(BaseModel):
    start_date: str = Field(..., description="ISO date string for work start")
    end_date: str | None = Field(
        default=None,
        description="ISO date string for work end; null/empty means current role",
    )
    is_current: bool = Field(default=False)


class RiskAssessmentRequest(BaseModel):
    work_history: List[WorkHistoryRiskItem] = Field(default_factory=list)
    candidate_skills: List[str] = Field(default_factory=list)
    job_requirements: str = Field(default="")
    expected_salary: float | None = Field(default=None)
    offered_salary: float | None = Field(default=None)
    interviews: List[InterviewRiskItem] = Field(default_factory=list)


class RiskAssessmentResponse(BaseModel):
    risk_score: float = Field(..., description="Risk score between 0 and 1")
    risk_label: str = Field(..., description="LOW, MEDIUM, or HIGH")
    stability_score: float = Field(..., description="Component risk between 0 and 1")
    skill_gap_score: float = Field(..., description="Component risk between 0 and 1")
    salary_alignment_score: float = Field(
        ..., description="Component risk between 0 and 1"
    )
    reliability_score: float = Field(..., description="Component risk between 0 and 1")
    status: str = Field(default="success")