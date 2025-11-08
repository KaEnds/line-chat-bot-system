from langchain.tools import tool
from typing import Optional

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

import requests

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