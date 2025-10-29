from Config.chatbot_agent_config import LLM as Chat
from langchain.agents import create_agent
from langchain.messages import AIMessage
from .tools import search, get_weather, add, get_account_info

def chatbot_with_groq(prompt: str) -> str:
    # ใช้ chat.chat.create() แทน completions
    messages = [
    (
        "system",
        "ตอบคำถามของผู้ใช้เป็นภาษาไทยอย่างกระชับและสุภาพ",
    ),
    ("human", prompt),
    ]

    reply = Chat.invoke(messages)
    return reply.content

def chatbot_agent(prompt: str) -> str:
    agent = create_agent(Chat, tools=[search, get_weather, add, get_account_info], system_prompt="You are a helpful assistant. Be concise and accurate.")

    reply = agent.invoke(
        {"messages": [{"role": "user", "content": prompt}]}
    )
    ai_messages = [msg for msg in reply["messages"] if isinstance(msg, AIMessage)]
    if ai_messages:
        return ai_messages[-1].content
    else:
        return "No response from AI"