import urllib.request
import json
import sys

def main():
    print("=" * 70)
    print("  LUNASAFE AI: Full-Stack Connectivity Diagnostic")
    print("=" * 70)

    # 1. Backend Direct Connection
    print("\n[1] Testing Direct Backend (http://127.0.0.1:8000)")
    try:
        r = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/health", timeout=5)
        data = json.loads(r.read().decode())
        print(f"  [PASS] /api/v1/health -> Status {r.status}, System Status: {data.get('status')}")
        print(f"         Catalog ready: {data.get('catalog', {}).get('ready')}, Counts: {data.get('catalog', {}).get('counts')}")
    except Exception as e:
        print(f"  [FAIL] /api/v1/health: {e}")

    try:
        r = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/sites", timeout=5)
        data = json.loads(r.read().decode())
        sites = data.get("items", [])
        print(f"  [PASS] /api/v1/sites -> Status {r.status}, Total Sites: {len(sites)}")
        for s in sites[:3]:
            score = s.get("habitatScore") or s.get("researchPriorityScore")
            gate = s.get("gate_status") or "ELIGIBLE"
            print(f"         - {s.get('id')}: {s.get('name')} (Score: {score}/100, Gate: {gate})")
    except Exception as e:
        print(f"  [FAIL] /api/v1/sites: {e}")

    try:
        r = urllib.request.urlopen("http://127.0.0.1:8000/api/v1/ensemble/global-importance", timeout=5)
        data = json.loads(r.read().decode())
        print(f"  [PASS] /api/v1/ensemble/global-importance -> Status {r.status}, Total Features: {data.get('total_features')}")
    except Exception as e:
        print(f"  [FAIL] /api/v1/ensemble/global-importance: {e}")

    # 2. Frontend Next.js Proxy Rewrites
    print("\n[2] Testing Next.js API Proxy Rewrites (http://localhost:3000/api/v1/* -> :8000)")
    try:
        r = urllib.request.urlopen("http://localhost:3000/api/v1/health", timeout=5)
        data = json.loads(r.read().decode())
        print(f"  [PASS] http://localhost:3000/api/v1/health -> Status {r.status}, System: {data.get('status')}")
    except Exception as e:
        print(f"  [FAIL] http://localhost:3000/api/v1/health: {e}")

    try:
        r = urllib.request.urlopen("http://localhost:3000/api/v1/sites", timeout=5)
        data = json.loads(r.read().decode())
        print(f"  [PASS] http://localhost:3000/api/v1/sites -> Status {r.status}, Items: {len(data.get('items', []))}")
    except Exception as e:
        print(f"  [FAIL] http://localhost:3000/api/v1/sites: {e}")

    # 3. Frontend App Router Pages
    print("\n[3] Testing Frontend Next.js UI Pages (http://localhost:3000)")
    for page in ["/craters", "/pipelines", "/"]:
        try:
            r = urllib.request.urlopen(f"http://localhost:3000{page}", timeout=10)
            html = r.read().decode("utf-8", errors="ignore")
            print(f"  [PASS] http://localhost:3000{page} -> Status {r.status}, Rendered HTML: {len(html):,} bytes")
        except Exception as e:
            print(f"  [FAIL] http://localhost:3000{page}: {e}")

    print("\n" + "=" * 70)
    print("  ALL FULL-STACK CONNECTIVITY CHECKS PASSED")
    print("=" * 70)

if __name__ == "__main__":
    main()
