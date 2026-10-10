import os
import re
import joblib
import numpy as np
import pandas as pd

backend_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
model_pickle_path = os.path.join(backend_root, 'models', 'random_forest_tuned.pkl')


class ModelLoader:
    def __init__(self):
        self.pipeline = None
        self._boot_model()

    def _boot_model(self):
        if not os.path.exists(model_pickle_path):
            return
        try:
            self.pipeline = joblib.load(model_pickle_path)
        except Exception as load_err:
            print(f"Warning: failed to load model from {model_pickle_path}: {load_err}")

    def predict(self, user_sample):
        if self.pipeline is None:
            return {'error': 'Classification model is currently unavailable'}

        try:
            # extract digits out of strings like '90 min' or '2 Seasons'
            dur_raw = str(user_sample.get('duration', '0'))
            num_match = re.search(r'(\d+)', dur_raw)
            duration_val = float(num_match.group(1)) if num_match else 0.0

            # parse date added year/month
            date_raw = str(user_sample.get('date_added', ''))
            try:
                dt_obj = pd.to_datetime(date_raw)
                added_yr = int(dt_obj.year)
                added_mo = int(dt_obj.month)
            except Exception:
                # flag missing date added with -1
                added_yr, added_mo = -1, -1

            director_val = user_sample.get('director', '').strip() or 'Unknown'
            country_val = user_sample.get('country', '').strip() or 'Unknown'

            input_frame = pd.DataFrame([{
                'type': user_sample.get('type', 'Movie'),
                'director': director_val,
                'country': country_val,
                'release_year': float(user_sample.get('release_year', 2020)),
                'listed_in': user_sample.get('listed_in', 'Documentaries'),
                'duration_num': duration_val,
                'added_year': added_yr,
                'added_month': added_mo
            }])

            top_pred = self.pipeline.predict(input_frame)[0]

            # extract top 3 probabilities for confidence meter
            prob_dict = {}
            if hasattr(self.pipeline, 'predict_proba'):
                raw_probs = self.pipeline.predict_proba(input_frame)[0]
                class_names = self.pipeline.classes_
                pairs = sorted(zip(class_names, raw_probs), key=lambda x: x[1], reverse=True)[:3]
                prob_dict = {str(c): float(p) for c, p in pairs}

            return {
                'prediction': top_pred,
                'probabilities': prob_dict
            }
        except Exception as pred_err:
            return {'error': str(pred_err)}


# singleton instance for routes
model_loader = ModelLoader()
