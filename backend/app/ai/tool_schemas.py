"""
JSON schema declarations describing each tool to the LLM. These are
provider-agnostic (Anthropic and OpenAI both accept "name/description/
input_schema"-shaped tool defs with minor renaming handled in the provider
adapters). member_id is deliberately NEVER a parameter here — the backend
injects it from the authenticated session so the model can't request another
member's data no matter what it's told to do by a prompt-injected message.
"""

TOOLS = [
    {
        "name": "search_books",
        "description": "Search the library catalog by title/ISBN keyword, category, or author. Returns matching books with availability.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Free-text title or ISBN keyword"},
                "category": {"type": "string", "description": "Category/genre name filter"},
                "author": {"type": "string", "description": "Author name filter"},
                "availability_only": {"type": "boolean", "description": "Only return books with available copies"},
                "limit": {"type": "integer", "description": "Max results, default 10"},
            },
        },
    },
    {
        "name": "get_book_details",
        "description": "Get full details for one specific book by its numeric ID.",
        "input_schema": {
            "type": "object",
            "properties": {"book_id": {"type": "integer"}},
            "required": ["book_id"],
        },
    },
    {
        "name": "check_book_availability",
        "description": "Check how many copies of a specific book are currently available.",
        "input_schema": {
            "type": "object",
            "properties": {"book_id": {"type": "integer"}},
            "required": ["book_id"],
        },
    },
    {
        "name": "search_authors",
        "description": "Search for authors by name.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}, "limit": {"type": "integer"}},
            "required": ["query"],
        },
    },
    {
        "name": "search_categories",
        "description": "List or search library categories/genres.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string"}, "limit": {"type": "integer"}},
        },
    },
    {
        "name": "get_my_borrowed_books",
        "description": "Get the CURRENT authenticated member's own currently-borrowed books. Never returns another member's data.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_my_due_dates",
        "description": "Get the CURRENT authenticated member's own upcoming due dates.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_my_fines",
        "description": "Get the CURRENT authenticated member's own fines (paid and unpaid) and unpaid total.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_library_statistics",
        "description": "Get aggregate, non-personal library statistics (total books, available books, member count).",
        "input_schema": {"type": "object", "properties": {}},
    },
]
