from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

postgresql_url = "postgresql+psycopg2://admin:adminpass@localhost:5433/librairy"

engine = create_engine(postgresql_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()