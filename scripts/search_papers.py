import urllib.request
import urllib.parse
import json

queries = [
    'Mare Tranquillitatis pit radar conduit Nature Astronomy Carrer',
    'Chandrayaan-2 Dual frequency Synthetic Aperture Radar DFSAR Bhiravarasu',
    'Automated Lunar Crater Identification Chandrayaan-2 TMC-2 Sinha',
    'Structural stability lunar lava tubes Blair Icarus',
    'Lunar lava tubes morphology structural stability Theinat Icarus',
    'Structural stability of lunar lava tubes with consideration of variable cross-section geometry',
    'Deep Learning in Multimodal Remote Sensing Data Fusion Review'
]

results = []
for q in queries:
    url = f'https://api.crossref.org/works?query={urllib.parse.quote(q)}&rows=2'
    req = urllib.request.Request(url, headers={'User-Agent': 'LunaSafeResearch/1.0 (mailto:team@lunasafe.org)'})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            items = data['message']['items']
            for item in items[:2]:
                title = item.get('title', ['No title'])[0]
                doi = item.get('DOI', 'No DOI')
                journal = item.get('container-title', ['No journal'])[0] if item.get('container-title') else 'No journal'
                year = item.get('issued', {}).get('date-parts', [[None]])[0][0]
                authors = ', '.join([a.get('family', '') for a in item.get('author', [])[:4]])
                results.append({
                    "query": q,
                    "title": title,
                    "authors": authors,
                    "year": year,
                    "journal": journal,
                    "doi": doi
                })
                print(f"[{year}] {authors} - '{title}', {journal}. DOI: {doi}")
    except Exception as e:
        print(f"Error for {q}: {e}")

with open("researched_papers.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2)
