from langchain.tools import tool
from typing import Optional
import requests

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

@tool
def get_account_info(user_id: str) -> str:
    """Get the current user's account information."""
    if user_id in USER_DATABASE:
        user = USER_DATABASE[user_id]
        return (
            f"Account holder: {user['name']}\n"
            f"Type: {user['account_type']}\n"
            f"Balance: ${user['balance']}\n"
            f"Email: {user['email']}"
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

@tool
def search_google_books(query: str) -> str:
    """Search for books using Google Books API and return titles and authors."""
    url = f"https://www.googleapis.com/books/v1/volumes?q={query}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        books = data.get("items", [])[:5] # เอาแค่ 5 เล่มแรก
        results = []
        for book in books:
            info = book.get("volumeInfo", {})
            title = info.get("title", "Unknown Title")
            authors = ", ".join(info.get("authors", ["Unknown Author"]))
            results.append(f"- {title} by {authors}")
        return "\n".join(results) if results else "No books found."
    else:
        return f"Error searching books: {response.status_code}"

import json
import requests
from langchain.tools import tool # ตรวจสอบว่าคุณ import tool ถูกต้อง

# ... (โค้ด tool อื่นๆ ของคุณ) ...

def create_book_bubble(book_info: dict) -> dict:
    """Helper function to create one Flex Message bubble for a book."""
    title = book_info.get("title", "Unknown Title")
    authors = ", ".join(book_info.get("authors", ["Unknown Author"]))
    thumbnail = book_info.get("imageLinks", {}).get("thumbnail", "https://example.com/default_book_icon.png")
    info_link = book_info.get("infoLink", "https://google.com/books")

    return {
        "type": "bubble",
        "hero": {
            "type": "image",
            "url": thumbnail.replace("http://", "https://"), # LINE ต้องใช้ HTTPS
            "size": "full",
            "aspectRatio": "20:13",
            "aspectMode": "cover"
        },
        "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "text",
                    "text": title,
                    "weight": "bold",
                    "size": "lg",
                    "wrap": True
                },
                {
                    "type": "text",
                    "text": authors,
                    "size": "sm",
                    "wrap": True,
                    "margin": "md"
                }
            ]
        },
        "footer": {
            "type": "box",
            "layout": "vertical",
            "contents": [
                {
                    "type": "button",
                    "action": {
                        "type": "uri",
                        "label": "ดูรายละเอียด",
                        "uri": info_link
                    },
                    "style": "primary",
                    "height": "sm"
                }
            ],
            "spacing": "sm"
        }
    }

@tool
def search_google_books_flex(query: str) -> str:
    """
    Search for books using Google Books API and return a JSON string 
    of a Flex Message Carousel.
    """
    url = f"https://www.googleapis.com/books/v1/volumes?q={query}"
    try:
        response = requests.get(url)
        response.raise_for_status() # Check for HTTP errors
        
        data = response.json()
        books = data.get("items", [])[:5] # เอาแค่ 5 เล่มแรก
        
        if not books:
            return "ไม่พบหนังสือที่ค้นหาครับ" # คืนค่าเป็น Text ธรรมดาถ้าไม่เจอ

        bubbles = []
        for book in books:
            info = book.get("volumeInfo", {})
            bubbles.append(create_book_bubble(info))

        # สร้างโครง Carousel Flex Message
        flex_message_json = {
            "type": "flex",
            "altText": f"ผลการค้นหาหนังสือสำหรับ: {query}", # ข้อความสำหรับ notification
            "contents": {
                "type": "carousel",
                "contents": bubbles
            }
        }
        
        # คืนค่าเป็น JSON String
        return json.dumps(flex_message_json)

    except requests.RequestException as e:
        print(f"Error searching books: {e}")
        return f"เกิดข้อผิดพลาดในการค้นหาหนังสือ: {e}"
    except Exception as e:
        print(f"Error creating Flex Message: {e}")
        return f"เกิดข้อผิดพลาดในการสร้างผลลัพธ์: {e}"

@tool
def get_book_info(
    title: Optional[str] = None,
    author: Optional[str] = None,
    isbn: Optional[str] = None,
    book_id: Optional[int] = None
) -> str:
    """
    Search for books in the library database.
    You can search by title, author, ISBN, or a specific book ID.
    At least one search parameter must be provided.
    Returns a JSON string of the found books.
    """
    
    # --- นี่คือการจำลองการทำงาน (Mock Implementation) ---
    # ในสถานการณ์จริง, ส่วนนี้จะไปเรียก API หรือ Query ฐานข้อมูล
    
    print(f"[Tool Call] Searching for book with: title={title}, author={author}, isbn={isbn}, id={book_id}")
    
    if book_id == 1000205:
        mock_books_found = [{
            "bibid": 1000205,
            "title": "System safety engineering and management /",
            "author": "Roland, Harold E",
            "isbn": "047169160"
        }]
        return json.dumps(mock_books_found)
    
    if title and "safety" in title.lower():
         mock_books_found = [{
            "bibid": 1000205,
            "title": "System safety engineering and management /",
            "author": "Roland, Harold E",
            "isbn": "047169160"
        }]
         return json.dumps(mock_books_found)

    # ถ้าไม่เจอ
    return json.dumps([])