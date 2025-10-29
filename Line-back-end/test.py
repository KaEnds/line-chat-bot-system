from Config.chatbot_agent_config import LLM as Chat
from Config.line_token_config import handler, configuration
from dataclasses import dataclass
from langchain.tools import tool, ToolRuntime
from langchain.agents import create_agent
from langchain.agents.middleware import wrap_tool_call, dynamic_prompt, ModelRequest
from langchain_core.messages import ToolMessage
import json

from linebot.v3.messaging import MessagingApi, ApiClient, TextMessage, ReplyMessageRequest
from linebot.models import ReplyMessageRequest

USER_DATABASE = {
    "user123": {
        "name": "Alice Johnson",
        "account_type": "Premium",
        "balance": 5000,
        "email": "alice@example.com"
    },
    "user456": {
        "name": "Bob Smith",
        "account_type": "Standard",
        "balance": 1200,
        "email": "bob@example.com"
    }
}

@dataclass
class Line_Context:
    reply_token: str

def reply_line_message(reply_token: str, text: str) -> str:
    """
    ส่งข้อความตอบกลับผู้ใช้บน LINE
    Args:
        reply_token: reply_token จาก Event
        text: ข้อความที่จะส่ง
    Returns:
        ผลลัพธ์การส่งข้อความ
    """
    with ApiClient(configuration) as api_client:
        line_bot_api = MessagingApi(api_client)
        line_bot_api.reply_message_with_http_info(
            ReplyMessageRequest(
                reply_token=reply_token,
                messages=[TextMessage(text=text)]
            )
        )
    return f"Message sent: {text}"

@tool
def get_account_info(user_id: str) -> str:
    """Get the current user's account information."""
    if user_id in USER_DATABASE:
        user = USER_DATABASE[user_id]
        return (
            f"Account holder: {user['name']}\n"
            f"Type: {user['account_type']}\n"
            f"Balance: ${user['balance']}"
        )
    return "User not found"

@tool
def add(a: int, b: int) -> str:
    """Add two numbers. and say ผลลัพธ์คือ <result>"""
    return str(a + b)

@tool
def search(query: str) -> str:
    """Search for information."""
    return f"Results for: {query}"

@tool
def get_weather(location: str) -> str:
    """Get weather information for a location."""
    return f"Weather in {location}: Sunny, 72°F"

@dynamic_prompt
def user_role_prompt(request: ModelRequest) -> str:
    """Generate system prompt based on user role."""
    user_role = request.runtime.context.get("user_role", "user")
    base_prompt = "You are a helpful assistant."

    if user_role == "expert":
        return f"{base_prompt} Provide detailed technical responses."
    elif user_role == "beginner":
        return f"{base_prompt} Explain concepts simply and avoid jargon."

    return base_prompt

agent = create_agent(Chat, tools=[search, get_weather, add, get_account_info, reply_line_message], system_prompt="You are a helpful assistant. Be concise and accurate.")

# result = agent.invoke(
#     {"messages": [{"role": "user", "content": "Can you help me add 15 and 27?"}]}
# )


# def pretty_print_result(result):
#     def default_serializer(obj):
#         """แปลง object ที่ serialize ไม่ได้ให้เป็น string"""
#         try:
#             return obj.__dict__
#         except:
#             return str(obj)

#     formatted = json.dumps(result, indent=4, ensure_ascii=False, default=default_serializer)
#     print(formatted)

# # ใช้งาน
# pretty_print_result(result)
for chunk in agent.stream({
    "messages": [{"role": "user", "content": "get information of user user123"}], 
}, stream_mode="values"):
    # Each chunk contains the full state at that point
    latest_message = chunk["messages"][-1]
    if latest_message.content:
        print(f"Agent: {latest_message.content}")
    elif latest_message.tool_calls:
        print(f"Calling tools: {[tc['name'] for tc in latest_message.tool_calls]}")