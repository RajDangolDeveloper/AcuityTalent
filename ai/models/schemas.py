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