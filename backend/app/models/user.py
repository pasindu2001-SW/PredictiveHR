from sqlalchemy import Column, Integer, String
from app.database import Base

class User(Base):
  
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    company = Column(String)
    hashed_password = Column(String, nullable=False)