from dotenv import load_dotenv
load_dotenv()

import os
import logging
import time
from typing import Optional
import requests


logger = logging.getLogger(__name__)


class LLMClientError(Exception):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class LocalLLMClient:
    def __init__(
        self,
        base_url: Optional[str] = None,
        account_id: Optional[str] = None,
        model: Optional[str] = None,
        max_tokens: int = 1024,
        temperature: float = 0.7,
        top_p: float = 0.9,
        timeout: int = 120,
    ):
        self.base_url = (
            base_url
            or os.getenv("CLOUDFLARE_AI_BASE_URL")
            or "https://api.cloudflare.com/client/v4"
        ).rstrip("/")
        self.account_id = (
            account_id
            or os.getenv("CLOUDFLARE_ACCOUNT_ID")
            or ""
        ).strip()
        self.model = (
            model or os.getenv("CLOUDFLARE_AI_MODEL") or "@cf/meta/llama-3-8b-instruct"
        ).strip()
        self.api_token = (os.getenv("CLOUDFLARE_API_TOKEN") or "").strip()
        self.max_tokens = int(os.getenv("CLOUDFLARE_MAX_OUTPUT_TOKENS", str(max_tokens)))
        self.temperature = float(os.getenv("CLOUDFLARE_TEMPERATURE", str(temperature)))
        self.top_p = float(os.getenv("CLOUDFLARE_TOP_P", str(top_p)))
        self.timeout = int(os.getenv("CLOUDFLARE_TIMEOUT_SECONDS", str(timeout)))
        logger.info(
            "Initialized LocalLLMClient model=%s base_url=%s account_present=%s token_present=%s",
            self.model,
            self.base_url,
            bool(self.account_id),
            bool(self.api_token),
        )

    def chat(self, system_prompt: str, user_prompt: str) -> str:
        start_time = time.monotonic()
        logger.info(
            "Starting LLM chat model=%s system_prompt_chars=%d user_prompt_chars=%d",
            self.model,
            len(system_prompt or ""),
            len(user_prompt or ""),
        )
        if not self.account_id:
            logger.error("LLM chat aborted: CLOUDFLARE_ACCOUNT_ID missing")
            raise LLMClientError(
                "Cloudflare AI is not configured: CLOUDFLARE_ACCOUNT_ID is missing.",
                status_code=500,
            )
        if not self.api_token:
            logger.error("LLM chat aborted: CLOUDFLARE_API_TOKEN missing")
            raise LLMClientError(
                "Cloudflare AI is not configured: CLOUDFLARE_API_TOKEN is missing.",
                status_code=500,
            )

        payload = {
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ]
        }

        try:
            response = requests.post(
                f"{self.base_url}/accounts/{self.account_id}/ai/run/{self.model}",
                headers={
                    "Authorization": f"Bearer {self.api_token}",
                    "Content-Type": "application/json",
                },
                json=payload,
                timeout=self.timeout,
            )
            logger.info(
                "Cloudflare request completed model=%s status_code=%s elapsed_ms=%d",
                self.model,
                response.status_code,
                int((time.monotonic() - start_time) * 1000),
            )
        except requests.Timeout as exc:
            logger.exception("Cloudflare request timed out model=%s", self.model)
            raise LLMClientError(
                "Cloudflare AI request timed out. Please retry or increase CLOUDFLARE_TIMEOUT_SECONDS.",
                status_code=504,
            ) from exc
        except requests.ConnectionError as exc:
            logger.exception("Cloudflare connection error model=%s", self.model)
            raise LLMClientError(
                "Could not connect to Cloudflare AI. Check network access and CLOUDFLARE_AI_BASE_URL.",
                status_code=503,
            ) from exc
        except requests.RequestException as exc:
            logger.exception("Cloudflare request failed model=%s", self.model)
            raise LLMClientError(
                f"Cloudflare AI request failed before receiving a response: {exc}",
                status_code=502,
            ) from exc

        try:
            data = response.json()
        except Exception as exc:
            logger.exception("Cloudflare returned non-JSON response model=%s", self.model)
            raise LLMClientError(
                "Cloudflare AI returned a non-JSON response.",
                status_code=502,
            ) from exc

        if not response.ok:
            detail = self._extract_error_message(data) or response.text.strip() or "No error details returned by Cloudflare AI."
            logger.error(
                "Cloudflare API error model=%s status_code=%s detail=%s",
                self.model,
                response.status_code,
                detail,
            )
            raise LLMClientError(
                f"Cloudflare AI error (HTTP {response.status_code}): {detail}",
                status_code=response.status_code,
            )

        if isinstance(data, dict) and data.get("success") is False:
            detail = self._extract_error_message(data) or "Cloudflare AI reported a failure without details."
            logger.error("Cloudflare success=false model=%s detail=%s", self.model, detail)
            raise LLMClientError(
                f"Cloudflare AI error: {detail}",
                status_code=502,
            )

        text = self._extract_text(data)
        if not text:
            logger.error("Cloudflare response missing text model=%s", self.model)
            raise LLMClientError(
                f"Cloudflare AI response did not include text content. Raw response: {data}",
                status_code=502,
            )

        logger.info(
            "LLM chat success model=%s output_chars=%d elapsed_ms=%d usage=%s",
            self.model,
            len(text),
            int((time.monotonic() - start_time) * 1000),
            self._extract_usage(data),
        )

        return text

    @staticmethod
    def _extract_usage(data) -> dict:
        if not isinstance(data, dict):
            return {}

        result = data.get("result", data)
        if not isinstance(result, dict):
            return {}

        usage = result.get("usage") or data.get("usage")
        if not isinstance(usage, dict):
            return {}

        return {
            "prompt_tokens": usage.get("prompt_tokens"),
            "completion_tokens": usage.get("completion_tokens"),
            "total_tokens": usage.get("total_tokens"),
        }

    @staticmethod
    def _extract_error_message(data) -> str:
        if isinstance(data, dict):
            errors = data.get("errors") or []
            if errors:
                first_error = errors[0] or {}
                message = first_error.get("message") or first_error.get("error")
                code = first_error.get("code")
                if message and code:
                    return f"{message} (code {code})"
                if message:
                    return str(message)
                if code:
                    return f"Error code {code}"

            messages = data.get("messages") or []
            if messages:
                first_message = messages[0]
                if isinstance(first_message, dict):
                    return first_message.get("message") or first_message.get("text") or ""

        return ""

    @staticmethod
    def _extract_text(data) -> str:
        def _extract_from_dict(node: dict) -> str:
            for key in ("response", "generated_text", "output", "text", "content"):
                value = node.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()

            # Some Cloudflare wrappers nest the generated text under response.response.
            nested_response = node.get("response")
            if isinstance(nested_response, dict):
                nested_text = _extract_from_dict(nested_response)
                if nested_text:
                    return nested_text

            if "choices" in node and isinstance(node["choices"], list) and node["choices"]:
                first_choice = node["choices"][0]
                if isinstance(first_choice, dict):
                    message = first_choice.get("message") or {}
                    if isinstance(message, dict):
                        value = message.get("content")
                        if isinstance(value, str) and value.strip():
                            return value.strip()

            return ""

        if isinstance(data, dict):
            result = data.get("result", data)

            if isinstance(result, str):
                return result.strip()

            if isinstance(result, dict):
                extracted = _extract_from_dict(result)
                if extracted:
                    return extracted

            if isinstance(result, list):
                for item in result:
                    if isinstance(item, str) and item.strip():
                        return item.strip()
                    if isinstance(item, dict):
                        extracted = _extract_from_dict(item)
                        if extracted:
                            return extracted

        return ""


class CoverLetterService:
    def __init__(
        self,
        client: Optional[LocalLLMClient] = None,
        model: str = "@cf/meta/llama-3-8b-instruct",
    ):
        self.client = client or LocalLLMClient(model=model)
        self.model = model

    def generate_cover_letter(self, resume_text: str, job_description: str) -> str:
        logger.info(
            "CoverLetterService.generate_cover_letter model=%s resume_chars=%d job_chars=%d",
            self.model,
            len(resume_text or ""),
            len(job_description or ""),
        )
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

        response = self.client.chat(system_prompt=system_prompt, user_prompt=user_prompt)
        logger.info("CoverLetterService.generate_cover_letter success output_chars=%d", len(response))
        return response


class ProfessionalRewriteService:
    def __init__(
        self,
        client: Optional[LocalLLMClient] = None,
        model: str = "@cf/meta/llama-3-8b-instruct",
    ):
        self.client = client or LocalLLMClient(model=model)
        self.model = model

    def improve_text(self, existing_text: str, topic: Optional[str] = None) -> str:
        logger.info(
            "ProfessionalRewriteService.improve_text model=%s text_chars=%d topic_present=%s",
            self.model,
            len(existing_text or ""),
            bool(topic),
        )
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

        response = self.client.chat(system_prompt=system_prompt, user_prompt=user_prompt)
        logger.info("ProfessionalRewriteService.improve_text success output_chars=%d", len(response))
        return response


class ResumeReviewService:
    def __init__(
        self,
        client: Optional[LocalLLMClient] = None,
        model: str = "@cf/meta/llama-3-8b-instruct",
    ):
        self.client = client or LocalLLMClient(model=model)
        self.model = model

    def review_resume(self, resume_text: str) -> dict:
        logger.info(
            "ResumeReviewService.review_resume model=%s resume_chars=%d",
            self.model,
            len(resume_text or ""),
        )
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

        content = self.client.chat(system_prompt=system_prompt, user_prompt=user_prompt)
        logger.info("ResumeReviewService.review_resume LLM output_chars=%d", len(content))
        parsed = self._parse_review(content)
        logger.info(
            "ResumeReviewService.review_resume parsed summary_chars=%d strengths_chars=%d changes_chars=%d tips_chars=%d",
            len(parsed.get("summary", "")),
            len(parsed.get("strength", "")),
            len(parsed.get("changes", "")),
            len(parsed.get("tips", "")),
        )
        return parsed

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

        parsed = {k: v.strip() for k, v in sections.items()}
        if not any(parsed.values()):
            parsed["summary"] = content.strip()
        return parsed

