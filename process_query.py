import sys
import spacy
import faiss
import numpy as np
import json

# Cargar el modelo spaCy
nlp = spacy.load("en_core_web_md")

# Cargar la base de conocimientos y crear los vectores
knowledge_base = [
    "Receta de Arroz blanco básico: ...",
    "Receta de Arroz frito chino: ..."
]

def preprocess(text):
    return nlp(text).vector

def create_index(docs):
    dimension = len(preprocess(docs[0]))
    index = faiss.IndexFlatL2(dimension)
    vectors = np.array([preprocess(doc) for doc in docs]).astype(np.float32)
    index.add(vectors)
    return index

def search_index(index, query):
    query_vector = preprocess(query).reshape(1, -1).astype(np.float32)
    _, indices = index.search(query_vector, k=3)
    return indices

def main():
    query = sys.argv[1]
    index = create_index(knowledge_base)
    indices = search_index(index, query)
    
    response = "\n\n".join([knowledge_base[i] for i in indices[0]])
    print(response)

if __name__ == "__main__":
    main()
