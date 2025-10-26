from Config.chatbot_agent_config import LLM as Chat

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
