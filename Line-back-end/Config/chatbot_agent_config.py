from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os

load_dotenv()

LLM = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="openai/gpt-oss-20b",
    temperature=0.7
)