from fastapi import APIRouter, Request, HTTPException
from linebot.v3.webhooks import MessageEvent, TextMessageContent
from linebot.v3.messaging import MessagingApi, ApiClient, TextMessage, ReplyMessageRequest
from Config.line_token_config import handler, configuration
from Agent.chatbot_agent import chatbot_agent

router = APIRouter()

@router.post("/callback")
async def callback(request: Request):
    signature = request.headers.get("x-line-signature")
    body_bytes = await request.body()
    body_str = body_bytes.decode("utf-8")

    try:
        handler.handle(body_str, signature)
    except Exception as e:
        print("WebhookHandler error:", e)
        raise HTTPException(status_code=400, detail=str(e))

    return "OK"

@handler.add(MessageEvent, message=TextMessageContent)
def handle_message(event):

    reply_msg = chatbot_agent(event.message.text)
    
    with ApiClient(configuration) as api_client:
        line_bot_api = MessagingApi(api_client)
        line_bot_api.reply_message_with_http_info(
            ReplyMessageRequest(
                reply_token=event.reply_token,
                messages=[TextMessage(text=reply_msg)]
            )
        )

