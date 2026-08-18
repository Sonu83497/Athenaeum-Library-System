import json
"""
LLM provider abstraction.

Supported providers:
- Groq
- Gemini
- Anthropic
- OpenAI
- None

Recommended configuration for this project:

    AI_PROVIDER=groq
    AI_API_KEY=your_groq_api_key
    AI_MODEL=openai/gpt-oss-120b

The provider is selected through the .env file.
"""

from dataclasses import dataclass, field
from typing import Any, Optional

from app.core.config import settings


# ============================================================
# NORMALIZED RESPONSE TYPES
# ============================================================

@dataclass
class ToolCall:
    id: str
    name: str
    arguments: dict


@dataclass
class ProviderResponse:
    text: str
    tool_calls: list[ToolCall] = field(default_factory=list)
    raw: Any = None


# ============================================================
# BASE PROVIDER
# ============================================================

class LLMProvider:
    """Base interface for all LLM providers."""

    def complete(
        self,
        messages: list[dict],
        tools: list[dict],
        system: str,
    ) -> ProviderResponse:
        raise NotImplementedError


# ============================================================
# GROQ PROVIDER
# ============================================================

class GroqProvider(LLMProvider):
    """
    Groq provider using the official Groq Python SDK.

    Recommended model:

        openai/gpt-oss-120b

    The client uses a longer timeout because some networks
    can take several seconds to complete the TLS/API request.
    """

    def __init__(self):
        from groq import Groq

        if not settings.AI_API_KEY:
            raise RuntimeError(
                "AI_API_KEY is not configured for Groq."
            )

        self.client = Groq(
            api_key=settings.AI_API_KEY,
            timeout=60.0,
            max_retries=2,
        )

    @staticmethod
    def _convert_tools(tools: list[dict]) -> list[dict]:
        """Convert internal tools to Groq/OpenAI format."""

        converted = []

        for tool in tools:
            converted.append(
                {
                    "type": "function",
                    "function": {
                        "name": tool["name"],
                        "description": tool.get(
                            "description",
                            "",
                        ),
                        "parameters": tool.get(
                            "input_schema",
                            {
                                "type": "object",
                                "properties": {},
                            },
                        ),
                    },
                }
            )

        return converted

    @staticmethod
    def _convert_messages(
        messages: list[dict],
        system: str,
    ) -> list[dict]:
        """
        Convert the project's internal message format
        into Groq/OpenAI-compatible messages.

        Supports:
        - user messages
        - assistant messages
        - text blocks
        - tool_use blocks
        - tool_result blocks
        """

        import json

        converted: list[dict] = []

        # ----------------------------------------------------
        # SYSTEM MESSAGE
        # ----------------------------------------------------

        if system:
            converted.append(
                {
                    "role": "system",
                    "content": system,
                }
            )

        # ----------------------------------------------------
        # NORMAL MESSAGES
        # ----------------------------------------------------

        for message in messages:
            role = message.get("role", "user")
            content = message.get("content", "")

            # ------------------------------------------------
            # STRING CONTENT
            # ------------------------------------------------

            if isinstance(content, str):
                converted.append(
                    {
                        "role": role,
                        "content": content,
                    }
                )
                continue

            # ------------------------------------------------
            # INVALID CONTENT
            # ------------------------------------------------

            if not isinstance(content, list):
                continue

            text_parts: list[str] = []
            assistant_tool_calls: list[dict] = []

            # ------------------------------------------------
            # CONTENT BLOCKS
            # ------------------------------------------------

            for block in content:
                block_type = block.get("type")

                # --------------------------------------------
                # TEXT
                # --------------------------------------------

                if block_type == "text":
                    text = block.get("text", "")

                    if text:
                        text_parts.append(text)

                # --------------------------------------------
                # TOOL USE
                # --------------------------------------------

                elif block_type == "tool_use":
                    tool_id = (
                        block.get("id")
                        or block.get("tool_use_id")
                        or "tool-call"
                    )

                    tool_name = block.get(
                        "name",
                        "",
                    )

                    tool_input = block.get(
                        "input",
                        {},
                    )

                    try:
                        arguments = json.dumps(
                            tool_input
                            if isinstance(tool_input, dict)
                            else {}
                        )
                    except (TypeError, ValueError):
                        arguments = "{}"

                    assistant_tool_calls.append(
                        {
                            "id": tool_id,
                            "type": "function",
                            "function": {
                                "name": tool_name,
                                "arguments": arguments,
                            },
                        }
                    )

                # --------------------------------------------
                # TOOL RESULT
                # --------------------------------------------

                elif block_type == "tool_result":
                    tool_id = (
                        block.get("tool_use_id")
                        or block.get("id")
                        or "tool-call"
                    )

                    raw_content = block.get(
                        "content",
                        "",
                    )

                    if isinstance(raw_content, str):
                        tool_content = raw_content
                    else:
                        try:
                            tool_content = json.dumps(
                                raw_content
                            )
                        except (TypeError, ValueError):
                            tool_content = str(raw_content)

                    converted.append(
                        {
                            "role": "tool",
                            "tool_call_id": tool_id,
                            "content": tool_content,
                        }
                    )

            # ------------------------------------------------
            # ASSISTANT MESSAGE
            # ------------------------------------------------

            if role == "assistant":
                assistant_message: dict = {
                    "role": "assistant",
                    "content": (
                        "\n".join(text_parts)
                        if text_parts
                        else None
                    ),
                }

                if assistant_tool_calls:
                    assistant_message["tool_calls"] = (
                        assistant_tool_calls
                    )

                converted.append(assistant_message)

            # ------------------------------------------------
            # USER MESSAGE
            # ------------------------------------------------

            elif role == "user":
                if text_parts:
                    converted.append(
                        {
                            "role": "user",
                            "content": "\n".join(text_parts),
                        }
                    )

        return converted

    def complete(
        self,
        messages: list[dict],
        tools: list[dict],
        system: str,
    ) -> ProviderResponse:
        """Send a completion request to Groq."""

        groq_messages = self._convert_messages(
            messages=messages,
            system=system,
        )

        groq_tools = self._convert_tools(tools)

        request_args = {
            "model": settings.AI_MODEL,
            "messages": groq_messages,
            "max_tokens": settings.AI_MAX_TOKENS,
            "temperature": 0.2,
        }

        # Only send tools when the application actually
        # provides tools.
        if groq_tools:
            request_args["tools"] = groq_tools

        # GPT-OSS models support reasoning controls.
        # Keep reasoning low so the library assistant returns
        # useful answers without wasting the token budget.
        if settings.AI_MODEL.startswith("openai/gpt-oss"):
            request_args["reasoning_effort"] = "low"

        response = self.client.chat.completions.create(
            **request_args
        )

        choice = response.choices[0]
        message = choice.message

        text = message.content or ""

        tool_calls: list[ToolCall] = []

        for tool_call in message.tool_calls or []:
            try:
                arguments = json.loads(
                    tool_call.function.arguments or "{}"
                )
            except (
                TypeError,
                ValueError,
                json.JSONDecodeError,
            ):
                arguments = {}

            tool_calls.append(
                ToolCall(
                    id=tool_call.id,
                    name=tool_call.function.name,
                    arguments=arguments,
                )
            )

        return ProviderResponse(
            text=text,
            tool_calls=tool_calls,
            raw=response,
        )


# ============================================================
# GEMINI PROVIDER
# ============================================================

class GeminiProvider(LLMProvider):
    """Google Gemini provider using google-genai SDK."""

    def __init__(self):
        from google import genai

        if not settings.AI_API_KEY:
            raise RuntimeError(
                "AI_API_KEY is not configured for Gemini."
            )

        self.client = genai.Client(
            api_key=settings.AI_API_KEY
        )

    @staticmethod
    def _convert_tools(
        tools: list[dict],
    ) -> list[Any]:
        from google.genai import types

        declarations = []

        for tool in tools:
            declarations.append(
                types.FunctionDeclaration(
                    name=tool["name"],
                    description=tool.get(
                        "description",
                        "",
                    ),
                    parameters_json_schema=tool.get(
                        "input_schema",
                        {
                            "type": "object",
                            "properties": {},
                        },
                    ),
                )
            )

        if not declarations:
            return []

        return [
            types.Tool(
                function_declarations=declarations
            )
        ]

    @staticmethod
    def _convert_messages(
        messages: list[dict],
    ) -> list[Any]:
        from google.genai import types
        import json

        converted = []

        for message in messages:
            role = message.get("role")
            content = message.get("content")

            if isinstance(content, str):
                converted.append(
                    types.Content(
                        role=(
                            "model"
                            if role == "assistant"
                            else "user"
                        ),
                        parts=[
                            types.Part.from_text(
                                text=content
                            )
                        ],
                    )
                )
                continue

            if not isinstance(content, list):
                continue

            parts = []

            for block in content:
                block_type = block.get("type")

                if block_type == "text":
                    text = block.get("text", "")

                    if text:
                        parts.append(
                            types.Part.from_text(
                                text=text
                            )
                        )

                elif block_type == "tool_use":
                    parts.append(
                        types.Part.from_function_call(
                            name=block["name"],
                            args=block.get(
                                "input",
                                {},
                            ),
                        )
                    )

                elif block_type == "tool_result":
                    raw_content = block.get(
                        "content",
                        "{}",
                    )

                    try:
                        result = json.loads(raw_content)
                    except (
                        TypeError,
                        json.JSONDecodeError,
                    ):
                        result = {
                            "result": str(raw_content)
                        }

                    function_name = (
                        block.get("name")
                        or block.get("tool_name")
                        or "unknown_tool"
                    )

                    parts.append(
                        types.Part.from_function_response(
                            name=function_name,
                            response={
                                "result": result
                            },
                        )
                    )

            if not parts:
                continue

            converted.append(
                types.Content(
                    role=(
                        "model"
                        if role == "assistant"
                        else "user"
                    ),
                    parts=parts,
                )
            )

        return converted

    def complete(
        self,
        messages: list[dict],
        tools: list[dict],
        system: str,
    ) -> ProviderResponse:
        from google.genai import types

        gemini_tools = self._convert_tools(tools)
        gemini_messages = self._convert_messages(messages)

        config = types.GenerateContentConfig(
            system_instruction=system,
            max_output_tokens=settings.AI_MAX_TOKENS,
            temperature=0.2,
        )

        if gemini_tools:
            config.tools = gemini_tools

        response = self.client.models.generate_content(
            model=settings.AI_MODEL,
            contents=gemini_messages,
            config=config,
        )

        text = response.text or ""

        tool_calls: list[ToolCall] = []

        for index, function_call in enumerate(
            response.function_calls or []
        ):
            tool_calls.append(
                ToolCall(
                    id=(
                        getattr(
                            function_call,
                            "id",
                            None,
                        )
                        or f"gemini-call-{index}"
                    ),
                    name=function_call.name,
                    arguments=dict(
                        function_call.args or {}
                    ),
                )
            )

        return ProviderResponse(
            text=text,
            tool_calls=tool_calls,
            raw=response,
        )


# ============================================================
# ANTHROPIC PROVIDER
# ============================================================

class AnthropicProvider(LLMProvider):
    """Anthropic provider."""

    def __init__(self):
        import anthropic

        if not settings.AI_API_KEY:
            raise RuntimeError(
                "AI_API_KEY is not configured for Anthropic."
            )

        self.client = anthropic.Anthropic(
            api_key=settings.AI_API_KEY
        )

    def complete(
        self,
        messages: list[dict],
        tools: list[dict],
        system: str,
    ) -> ProviderResponse:
        response = self.client.messages.create(
            model=settings.AI_MODEL,
            max_tokens=settings.AI_MAX_TOKENS,
            system=system,
            messages=messages,
            tools=tools,
        )

        text_parts = []
        tool_calls = []

        for block in response.content:
            if block.type == "text":
                text_parts.append(block.text)

            elif block.type == "tool_use":
                tool_calls.append(
                    ToolCall(
                        id=block.id,
                        name=block.name,
                        arguments=block.input or {},
                    )
                )

        return ProviderResponse(
            text="".join(text_parts),
            tool_calls=tool_calls,
            raw=response,
        )


# ============================================================
# OPENAI PROVIDER
# ============================================================

class OpenAIProvider(LLMProvider):
    """OpenAI provider."""

    def __init__(self):
        import openai  # type: ignore

        if not settings.AI_API_KEY:
            raise RuntimeError(
                "AI_API_KEY is not configured for OpenAI."
            )

        self.client = openai.OpenAI(
            api_key=settings.AI_API_KEY
        )

    @staticmethod
    def _to_openai_tools(
        tools: list[dict],
    ) -> list[dict]:
        return [
            {
                "type": "function",
                "function": {
                    "name": tool["name"],
                    "description": tool.get(
                        "description",
                        "",
                    ),
                    "parameters": tool.get(
                        "input_schema",
                        {
                            "type": "object",
                            "properties": {},
                        },
                    ),
                },
            }
            for tool in tools
        ]

    def complete(
        self,
        messages: list[dict],
        tools: list[dict],
        system: str,
    ) -> ProviderResponse:
        import json

        openai_messages = [
            {
                "role": "system",
                "content": system,
            }
        ]

        openai_messages.extend(messages)

        request_args = {
            "model": settings.AI_MODEL,
            "max_tokens": settings.AI_MAX_TOKENS,
            "messages": openai_messages,
        }

        openai_tools = self._to_openai_tools(tools)

        if openai_tools:
            request_args["tools"] = openai_tools

        response = self.client.chat.completions.create(
            **request_args
        )

        choice = response.choices[0].message

        tool_calls = []

        for tool_call in choice.tool_calls or []:
            try:
                arguments = json.loads(
                    tool_call.function.arguments or "{}"
                )
            except (
                TypeError,
                ValueError,
                json.JSONDecodeError,
            ):
                arguments = {}

            tool_calls.append(
                ToolCall(
                    id=tool_call.id,
                    name=tool_call.function.name,
                    arguments=arguments,
                )
            )

        return ProviderResponse(
            text=choice.content or "",
            tool_calls=tool_calls,
            raw=response,
        )


# ============================================================
# PROVIDER FACTORY
# ============================================================

def get_provider() -> Optional[LLMProvider]:
    """
    Return the configured LLM provider.

    Supported values:

        groq
        gemini
        anthropic
        openai
        none
    """

    provider = (
        settings.AI_PROVIDER or ""
    ).strip().lower()

    if provider == "groq":
        return GroqProvider()

    if provider == "gemini":
        return GeminiProvider()

    if provider == "anthropic":
        return AnthropicProvider()

    if provider == "openai":
        return OpenAIProvider()

    if provider in ("", "none"):
        return None

    raise RuntimeError(
        f"Unsupported AI_PROVIDER: {provider}"
    )
