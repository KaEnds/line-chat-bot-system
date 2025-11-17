from fastapi import APIRouter, FastAPI, Query
from pydantic import BaseModel
import psycopg2
import numpy as np
import re
import sys
from psycopg2.extensions import register_adapter, QuotedString
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware

# -------------------------
# 🔧 CONFIG
# -------------------------
PG_URL = "postgresql://admin:adminpass@localhost:5433/librairy"
TABLE_NAME = "librairy.test_bib4"
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
VECTOR_DIMENSION = 384

router = APIRouter()

# -------------------------
# 🔧 Register Numpy Vector Adapter (pgvector)
# -------------------------
def register_vector_adapter():
    def addapt_numpy_array(numpy_array):
        vector_string_raw = str(numpy_array.tolist())
        cleaned_values = re.sub(r',\s*', ',', vector_string_raw.strip('[] '))
        final_array_literal = f'[{cleaned_values}]'
        return QuotedString(final_array_literal)

    register_adapter(np.ndarray, addapt_numpy_array)


# -------------------------
# 🧠 Load Model Once
# -------------------------
encoder = None

@router.on_event("startup")
def load_model():
    global encoder
    try:
        encoder = SentenceTransformer(MODEL_NAME)
        print(f"✅ Loaded model: {MODEL_NAME}")
    except Exception as e:
        print(f"❌ Error loading model: {e}", file=sys.stderr)


# -------------------------
# 🧠 Helper: Create query embedding
# -------------------------
def get_query_vector(query_text: str):
    try:
        embedding = encoder.encode(query_text, convert_to_numpy=True)
        if embedding.ndim == 2:
            embedding = embedding[0]
        return np.array(embedding, dtype=np.float32)
    except Exception as e:
        print("❌ Embedding error:", e)
        return None


# -------------------------
# 📌 Vector Search Function
# -------------------------
def vector_search(query_text: str, k_limit: int = 5):
    query_vector = get_query_vector(query_text)
    if query_vector is None:
        return []

    sql_query = f"""
        SELECT *,
               1 - (vector <=> %s::vector(384)) AS similarity_score
        FROM {TABLE_NAME}
        ORDER BY vector <=> %s::vector(384)
        LIMIT %s;
    """

    try:
        register_vector_adapter()
        conn = psycopg2.connect(PG_URL)
        cur = conn.cursor()

        cur.execute(sql_query, (query_vector, query_vector, k_limit))

        column_names = [desc[0] for desc in cur.description]
        rows = cur.fetchall()

        results = []
        for row in rows:
            row_dict = dict(zip(column_names, row))
            row_dict["similarity_score"] = round(row_dict["similarity_score"], 4)
            if "vector" in row_dict:
                del row_dict["vector"]
            results.append(row_dict)

        return results

    finally:
        if conn:
            conn.close()


# -------------------------
# 📌 API Endpoint
# -------------------------

@router.get("/search")
def search_books(keyword: str = Query(...), k: int = Query(5)):
    results = vector_search(keyword, k)

    if not results:
        return {"message": "ไม่พบข้อมูล"}

    # ส่งเฉพาะฟิลด์ที่ต้องการ
    formatted = []
    for row in results:
        formatted.append({
            "BIBID": row.get("bibid"),
            "TITLE": row.get("title"),
            "AUTHOR": row.get("author"),
            "ISBN": row.get("isbn"),
            "ISSN": row.get("issn"),
            "PUBLISHER": row.get("publisher"),
            "YEAR_OF_PUBLICATION": row.get("publicationyear"),
            "TABLE_OF_CONTENT": row.get("toc"),
            "DESCRIPTION": row.get("description"),
            "FORMAT": row.get("format"),
            "SUBJECT": row.get("subject"),
            "LANG": row.get("lang"),
            "BRANCHID": row.get("branchid"),
            "EDITION": row.get("edition"),
            "similarity_score": row.get("similarity_score"),
        })

    return formatted
