# app.py
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

# Initialize FastAPI app
app = FastAPI(
    title="REB Resource Recommendation API",
    description="API for recommending REB e-learning resources based on assignment descriptions",
    version="1.0.0"
)

# Define request and response models
class AssignmentRequest(BaseModel):
    description: str
    grade_level: str = None  # Optional parameter

class RecommendationResponse(BaseModel):
    resource_url: str
    subject: str
    grade_level: str
    similarity_score: float

# Load model components
@app.on_event("startup")
async def load_model():
    global nlp, vectorizer, resource_vectors, reb_resources
    
    # Load spaCy model
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        # If model not found, download it
        import subprocess
        subprocess.call([
            "python", "-m", "spacy", "download", "en_core_web_sm"
        ])
        nlp = spacy.load("en_core_web_sm")
    
    # Load dataset from CSV
    try:
        reb_resources = pd.read_csv("reb_resources.csv")
        
        # Check if we have saved vectorizer and vectors
        if os.path.exists("vectorizer.pkl") and os.path.exists("resource_vectors.pkl"):
            vectorizer = pickle.load(open("vectorizer.pkl", "rb"))
            resource_vectors = pickle.load(open("resource_vectors.pkl", "rb"))
        else:
            # Prepare for vectorization
            reb_resources['Combined Text'] = reb_resources[['Grade Level', 'Subject', 'Topic Keywords']].agg(' '.join, axis=1)
            
            # TF-IDF Vectorization
            vectorizer = TfidfVectorizer()
            resource_vectors = vectorizer.fit_transform(reb_resources['Combined Text'])
            
            # Save for future use
            pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))
            pickle.dump(resource_vectors, open("resource_vectors.pkl", "wb"))
    
    except Exception as e:
        print(f"Error loading dataset: {e}")
        # Fallback to empty dataset
        reb_resources = pd.DataFrame(columns=['Grade Level', 'Subject', 'Topic Keywords', 'URL'])
        vectorizer = TfidfVectorizer()
        resource_vectors = vectorizer.fit_transform([])

# Define API endpoints
@app.get("/")
async def root():
    return {"message": "Welcome to the REB Resource Recommendation API"}

@app.post("/recommend", response_model=RecommendationResponse)
async def recommend_resource(request: AssignmentRequest):
    """
    Recommends an REB e-learning resource based on assignment description.
    
    - **description**: Assignment description text
    - **grade_level**: Optional parameter to filter by grade level
    """
    try:
        # Preprocess assignment text
        assignment_doc = nlp(request.description.lower())
        keywords = ' '.join([token.lemma_ for token in assignment_doc if not token.is_stop])
        
        # Convert to TF-IDF vector
        assignment_vector = vectorizer.transform([keywords])
        
        # Filter by grade level if provided
        if request.grade_level:
            filtered_indices = reb_resources[reb_resources['Grade Level'] == request.grade_level].index
            if filtered_indices.empty:
                raise HTTPException(status_code=404, detail=f"No resources found for grade level: {request.grade_level}")
            filtered_vectors = resource_vectors[filtered_indices]
            similarities = cosine_similarity(assignment_vector, filtered_vectors)
            best_match_idx = filtered_indices[np.argmax(similarities)]
            similarity_score = np.max(similarities)
        else:
            # Compute similarity with all resources
            similarities = cosine_similarity(assignment_vector, resource_vectors)
            best_match_idx = np.argmax(similarities)
            similarity_score = similarities[0][best_match_idx]
        
        best_resource = reb_resources.iloc[best_match_idx]
        
        return {
            "resource_url": best_resource['URL'],
            "subject": best_resource['Subject'],
            "grade_level": best_resource['Grade Level'],
            "similarity_score": float(similarity_score)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/resources")
async def list_resources():
    """Returns a list of all available resources in the dataset."""
    resources = reb_resources[['Grade Level', 'Subject', 'URL']].to_dict(orient='records')
    return {"resources": resources}

# Run the application
if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000)