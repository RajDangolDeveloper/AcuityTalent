from typing import Optional

from qwen_api.client import Qwen
from qwen_api.types.chat import ChatMessage


class CoverLetterService:
    def __init__(self, client: Optional[Qwen] = None, model: str = "qwen-max-latest"):
        self.client = client or Qwen()
        self.model = model

    def generate_cover_letter(self, resume_text: str, job_description: str) -> str:
        system_prompt = (
            "You are a professional resume and cover letter writer with many years of "
            "experience across industries. You specialise in creating highly tailored, "
            "ATS-friendly cover letters that clearly connect a candidate's experience "
            "to the requirements of a specific role. Your tone is polished, concise, "
            "and confident, and you always write in the first person from the "
            "candidate's perspective."
        )

        user_prompt = (
            "Using the following inputs, write a custom cover letter that is tailored "
            "to the job description. The letter must:\n"
            "- Use a professional, confident tone.\n"
            "- Highlight the most relevant skills, experience, and achievements from the resume.\n"
            "- Explicitly align the candidate's background with the key requirements of the job description.\n"
            "- Be ATS-friendly, with clear, keyword-rich phrasing.\n"
            "- Be structured with a clear opening, 2–3 focused body paragraphs, and a concise closing.\n\n"
            "Candidate resume text:\n"
            "----------------------\n"
            f"{resume_text}\n\n"
            "Job description:\n"
            "----------------\n"
            f"{job_description}\n\n"
            "Now write the complete cover letter."
        )

        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(role="user", content=user_prompt),
        ]

        response = self.client.chat.create(messages=messages, model=self.model)
        return response.choices[0].message.content


class ProfessionalRewriteService:
    def __init__(self, client: Optional[Qwen] = None, model: str = "qwen-max-latest"):
        self.client = client or Qwen()
        self.model = model

    def improve_text(self, existing_text: str, topic: Optional[str] = None) -> str:
        topic_instruction = (
            f"The writing is about the following topic: {topic}.\n"
            if topic
            else ""
        )

        system_prompt = (
            "You are an expert professional writer and resume optimisation specialist. "
            "You rewrite content to be clearer, more concise, and highly professional "
            "while preserving the original meaning. You optimise phrasing to be "
            "ATS-friendly by incorporating relevant, natural-sounding keywords without "
            "buzzword stuffing."
        )

        user_prompt = (
            f"{topic_instruction}"
            "Improve the following text so that it:\n"
            "- Sounds professional and polished.\n"
            "- Uses clear, direct language and strong action verbs.\n"
            "- Is well-structured and easy to scan.\n"
            "- Is optimised for Applicant Tracking Systems (ATS) while keeping the meaning intact.\n"
            "- Does not invent new experience, skills, or achievements.\n\n"
            "Original text:\n"
            "--------------\n"
            f"{existing_text}\n\n"
            "Now provide only the improved version of the text."
        )

        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(role="user", content=user_prompt),
        ]

        response = self.client.chat.create(messages=messages, model=self.model)
        return response.choices[0].message.content


class ResumeReviewService:
    def __init__(self, client: Optional[Qwen] = None, model: str = "qwen-max-latest"):
        self.client = client or Qwen()
        self.model = model

    def review_resume(self, resume_text: str) -> dict:
        system_prompt = (
            "You are a senior career coach and professional resume reviewer. "
            "You analyse resumes and provide practical, structured feedback tailored "
            "to modern recruiting practices and ATS systems."
        )

        user_prompt = (
            "You will receive the full text of a candidate's resume. Analyse it and provide "
            "a professional review with the following four sections:\n"
            "1) SUMMARY - Brief overall assessment.\n"
            "2) STRENGTHS - Concrete strengths and what is working well.\n"
            "3) CHANGES - Specific, actionable changes to improve the resume.\n"
            "4) TIPS - General tips to further optimise the resume.\n\n"
            "Please respond strictly in the following format:\n"
            "SUMMARY:\n"
            "<summary text>\n\n"
            "STRENGTHS:\n"
            "<strengths text>\n\n"
            "CHANGES:\n"
            "<changes text>\n\n"
            "TIPS:\n"
            "<tips text>\n\n"
            "Here is the resume text:\n"
            "------------------------\n"
            f"{resume_text}"
        )

        messages = [
            ChatMessage(role="system", content=system_prompt),
            ChatMessage(role="user", content=user_prompt),
        ]

        response = self.client.chat.create(messages=messages, model=self.model)
        content = response.choices[0].message.content
        return self._parse_review(content)

    def _parse_review(self, content: str) -> dict:
        sections = {"summary": "", "strength": "", "changes": "", "tips": ""}
        current = None

        for line in content.splitlines():
            upper = line.strip().upper()
            if upper.startswith("SUMMARY:"):
                current = "summary"
                continue
            if upper.startswith("STRENGTHS:"):
                current = "strength"
                continue
            if upper.startswith("CHANGES:"):
                current = "changes"
                continue
            if upper.startswith("TIPS:"):
                current = "tips"
                continue
            if current:
                sections[current] += (line + "\n")

        return {k: v.strip() for k, v in sections.items()}

