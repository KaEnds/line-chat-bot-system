from sqlalchemy import create_engine, Column, BigInteger, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

postgresql_url = "postgresql+psycopg2://admin:adminpass@localhost:5433/librairy"

engine = create_engine(postgresql_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class TestBib(Base):
    __tablename__ = 'test_bib'
    __table_args__ = {'schema': 'librairy'}

    # กำหนดคอลัมน์ตามที่เห็นใน pgAdmin
    bibid = Column(BigInteger, primary_key=True, index=True)
    title = Column(Text)
    author = Column(Text)
    isbn = Column(Text)
    issn = Column(Text)
    publisher = Column(Text)
    table_of_content = Column(Text)
    description = Column(Text)
    format = Column(Text)
    subject = Column(Text)
    lang = Column(Text)
    branchid = Column(Text)
    edition = Column(Text)

    def __repr__(self):
        return f"<TestBib(bibid={self.bibid}, title='{self.title}')>"