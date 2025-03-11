FROM python:3.10-slim

WORKDIR /model 

# Assuming Dockerfile is in the model directory along with other files
COPY model-requirements.txt .
RUN pip install -r model-requirements.txt
RUN python -m spacy download en_core_web_sm

# Copy all the needed files from the model directory
COPY app.py .
COPY *.pkl .
COPY *.csv .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]