import csv
import os
from typing import List, Dict, Any, Optional

class ManifestManager:
    """Manages the dataset manifest, ensuring all files are tracked with provenance."""
    
    def __init__(self, manifest_path: str = "data/manifest.csv"):
        self.manifest_path = manifest_path
        self.records: List[Dict[str, Any]] = []
        if os.path.exists(manifest_path):
            self.load()

    def load(self) -> List[Dict[str, Any]]:
        self.records = []
        with open(self.manifest_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                self.records.append(row)
        return self.records

    def get_by_instrument(self, instrument: str) -> List[Dict[str, Any]]:
        return [r for r in self.records if r.get("instrument", "").upper() == instrument.upper()]

    def get_by_id(self, file_id: str) -> Optional[Dict[str, Any]]:
        for r in self.records:
            if r.get("file_id") == file_id:
                return r
        return None

    def validate_integrity(self) -> Dict[str, Any]:
        """Validates manifest completeness and required columns."""
        required = ["file_id", "source", "instrument", "product_id", "product_level", "crs", "pixel_size"]
        valid = True
        missing_fields = []
        for r in self.records:
            for field in required:
                if not r.get(field):
                    valid = False
                    missing_fields.append((r.get("file_id", "unknown"), field))
        return {
            "valid": valid,
            "total_records": len(self.records),
            "missing_fields": missing_fields
        }
