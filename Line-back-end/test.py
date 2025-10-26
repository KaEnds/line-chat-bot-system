from langchain_mcp_adapters.client import MultiServerMCPClient
from Config.chatbot_agent_config import LLM as Chat
import asyncio

async def main():
    client = MultiServerMCPClient({
        "line-bot": {
            "transport": "streamable_http",  # ต้องใช้ transport ที่รองรับ
            "url": "http://localhost:6274/",
            # "auth_token": "78ee9989e4566442282db9b8bcf8b873faf3d6dc15c1a668783e5964d7c74c7f"
        }
    })


    # ดึง tools (await เพราะเป็น async)
    tools = await client.get_tools()

    # สร้าง Agent
    agent = Chat.as_agent(tools=tools)

    # ฟังก์ชันส่ง prompt
    async def chatbot_with_line(prompt: str) -> str:
        messages = [
            ("system", "ตอบคำถามของผู้ใช้เป็นภาษาไทยอย่างกระชับและสุภาพ"),
            ("human", prompt),
        ]
        reply = await agent.invoke({"messages": messages})
        return reply["content"]  # เพราะ invoke คืน dict

    # ตัวอย่างใช้งาน
    user_input = "สวัสดีครับ แนะนำตัวเองหน่อย"
    response = await chatbot_with_line(user_input)
    print("LINE Response:", response)

asyncio.run(main())
