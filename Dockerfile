FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

# First create the filtered requirements file
# RUN grep -v "pywin32" requirements.txt > requirements.txt

# Install the requirements
RUN pip install --no-cache-dir -r requirements.txt

# Explicitly ensure spaCy is installed
RUN pip install --no-cache-dir spacy

# Now download the language model
RUN python -m spacy download en_core_web_sm

COPY app.py .

# Add your CMD or ENTRYPOINT here

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", "8000"]