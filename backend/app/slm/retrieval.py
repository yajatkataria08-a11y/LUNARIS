"""TF-IDF Vector Retrieval Engine over the Lunar Remote Sensing and Habitat Corpus."""

from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from backend.app.slm.knowledge_base import LUNAR_RESEARCH_CORPUS


class LiteratureRetriever:
    """Retrieves peer-reviewed literature passages relevant to queries or site profiles."""

    def __init__(self):
        self.corpus = LUNAR_RESEARCH_CORPUS
        self.documents = [
            f"{doc['title']} {doc['key_findings']} {' '.join(doc['topics'])}"
            for doc in self.corpus
        ]
        self.vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        self.doc_vectors = self.vectorizer.fit_transform(self.documents)

    def retrieve(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        """Retrieve the most relevant scientific papers for a given user query."""
        if not query.strip():
            return self.corpus[:top_k]

        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.doc_vectors).ravel()

        top_indices = np.argsort(similarities)[::-1][:top_k]
        results = []
        for idx in top_indices:
            doc = dict(self.corpus[idx])
            doc["relevance_score"] = round(float(similarities[idx]), 3)
            results.append(doc)
        return results


literature_retriever = LiteratureRetriever()
