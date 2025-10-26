from mcp import MCPServer
from fastapi import FastAPI, Request
import json

app = FastAPI()
mcp = MCPServer(name="line")

@app.post("/webhook")
async def webhook(req: Request):
    body = await req.json()
    # ส่ง event จาก LINE ไปให้ LangChain ผ่าน MCP
    await mcp.send_event("line_message", body)
    return {"status": "ok"}

@mcp.on("send_message")
async def send_message(payload):
    # เรียก LINE Messaging API ส่งข้อความกลับ
    ...