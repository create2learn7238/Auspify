import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_FALLBACK = os.path.join(BASE_DIR, 'data', 'Dataset.csv')

class DataService:
    def __init__(self):
        self.active_dataset_path = CSV_FALLBACK
        self._df = None

    def get_dataframe(self):
        if self._df is None:
            self.load_dataset()
        return self._df

    def load_dataset(self, path=None):
        target = path or self.active_dataset_path
        try:
            raw = pd.read_csv(target)
            self._df = raw
            self.active_dataset_path = target
            return True, "Dataset loaded successfully"
        except Exception as err:
            return False, f"Failed reading csv: {err}"

    def reset_to_default(self):
        return self.load_dataset(CSV_FALLBACK)

    def get_dataset_info(self):
        items = self.get_dataframe()
        if items is None:
            return {"error": "No dataset loaded"}

        # tally counts for quick dashboard badges
        n_movies = int((items['type'] == 'Movie').sum()) if 'type' in items.columns else 0
        n_tv = int((items['type'] == 'TV Show').sum()) if 'type' in items.columns else 0

        return {
            "active_dataset": os.path.basename(self.active_dataset_path),
            "total_rows": int(len(items)),
            "total_columns": int(items.shape[1]),
            "columns": items.columns.tolist(),
            "data_types": {col: str(dt) for col, dt in items.dtypes.items()},
            "missing_values": items.isnull().sum().to_dict(),
            "duplicate_count": int(items.duplicated().sum()),
            "total_movies": n_movies,
            "total_tv": n_tv
        }

    def get_paginated_data(self, page=1, limit=50, search='', sort_by=None, sort_desc=False):
        table = self.get_dataframe()
        if table is None:
            return {"error": "No dataset loaded"}

        view = table
        # case-insensitive search across every text col
        query = str(search).strip().lower()
        if query:
            match_matrix = [view[c].astype(str).str.lower().str.contains(query, na=False) for c in view.columns]
            hit_mask = np.column_stack(match_matrix).any(axis=1)
            view = view.loc[hit_mask]

        if sort_by and sort_by in view.columns:
            view = view.sort_values(by=sort_by, ascending=not sort_desc)

        n_matches = int(len(view))
        pages_total = max(1, (n_matches + limit - 1) // limit)

        offset = (page - 1) * limit
        chunk = view.iloc[offset:offset + limit].copy()

        # numpy nan breaks json encoder, convert to None
        clean_rows = chunk.replace({np.nan: None}).to_dict(orient='records')

        return {
            "data": clean_rows,
            "pagination": {
                "page": page,
                "limit": limit,
                "total_rows": n_matches,
                "total_pages": pages_total
            }
        }

    def get_features_info(self):
        table = self.get_dataframe()
        if table is None:
            return {"error": "No dataset loaded"}
        
        cat_cols = table.select_dtypes(include=['object', 'category']).columns.tolist()
        num_cols = table.select_dtypes(include=['int64', 'float64']).columns.tolist()
        
        return {
            "categorical": cat_cols,
            "numerical": num_cols
        }

# shared app instance
data_service = DataService()
