import warnings
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC

warnings.filterwarnings('ignore')


class NetflixMLPipeline:
    def __init__(self, csv_filepath):
        self.csv_filepath = csv_filepath
        self.df = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.models = {}
        self.results = {}
        self.trained = False
        self.feature_names = []
        self.label_encoder = LabelEncoder()
        self.rating_encoder = LabelEncoder()

    def load_and_engineer(self):
        raw_df = pd.read_csv(self.csv_filepath)

        # drop entries without critical metadata
        raw_df.dropna(subset=['type', 'title'], inplace=True)
        raw_df['director'].fillna('Unknown', inplace=True)
        raw_df['country'].fillna('Unknown', inplace=True)
        raw_df['rating'].fillna('Unknown', inplace=True)
        raw_df['listed_in'].fillna('', inplace=True)

        # parse duration numbers out of strings like '90 min' or '2 Seasons'
        film_mask = raw_df['type'] == 'Movie'
        raw_df['duration_minutes'] = np.nan
        raw_df['duration_seasons'] = np.nan

        raw_df.loc[film_mask, 'duration_minutes'] = (
            raw_df.loc[film_mask, 'duration'].str.extract(r'(\d+)')[0].astype(float)
        )
        raw_df.loc[~film_mask, 'duration_seasons'] = (
            raw_df.loc[~film_mask, 'duration'].str.extract(r'(\d+)')[0].astype(float)
        )

        # extract date components from netflix addition timestamp
        raw_df['date_added'] = pd.to_datetime(raw_df['date_added'], errors='coerce')
        raw_df['year_added'] = raw_df['date_added'].dt.year
        raw_df['month_added'] = raw_df['date_added'].dt.month

        # baseline reference: netflix streaming launch ~ 2008
        raw_df['days_to_add'] = (raw_df['date_added'] - pd.to_datetime('2008-01-01')).dt.days

        # calculate how long the title took to get on netflix after original release
        raw_df['content_age'] = (raw_df['year_added'] - raw_df['release_year']).clip(lower=0)
        raw_df['genre_count'] = raw_df['listed_in'].str.split(',').str.len()

        # one-hot flags for high-frequency genres
        core_genres = [
            'Dramas', 'Comedies', 'Documentaries', 'Action', 'Thrillers',
            'Romance', 'Horror', 'Children', 'International', 'Crime'
        ]
        for genre_name in core_genres:
            raw_df[f'genre_{genre_name.lower()}'] = raw_df['listed_in'].str.contains(
                genre_name, case=False, na=False
            ).astype(int)

        # top producer countries flag
        major_markets = [
            'United States', 'India', 'United Kingdom', 'Canada', 'France',
            'Japan', 'South Korea', 'Spain', 'Germany', 'Australia'
        ]
        for country_name in major_markets:
            flag_key = f'country_{country_name.replace(" ", "_").lower()}'
            raw_df[flag_key] = (raw_df['country'] == country_name).astype(int)

        raw_df['rating_encoded'] = self.rating_encoder.fit_transform(raw_df['rating'].astype(str))
        raw_df['is_movie'] = (raw_df['type'] == 'Movie').astype(int)

        self.df = raw_df
        return self.df

    def _prepare_features(self):
        work_df = self.df.copy()

        f_cols = [
            'release_year', 'year_added', 'month_added', 'days_to_add',
            'content_age', 'genre_count', 'rating_encoded',
            'genre_dramas', 'genre_comedies', 'genre_documentaries',
            'genre_action', 'genre_thrillers', 'genre_romance',
            'genre_horror', 'genre_children', 'genre_international', 'genre_crime',
            'country_united_states', 'country_india', 'country_united_kingdom',
            'country_canada', 'country_france', 'country_japan',
            'country_south_korea', 'country_spain', 'country_germany', 'country_australia'
        ]

        # approximate unified duration metric (1 season ~ 20 min episode baseline)
        work_df['duration_value'] = (
            work_df['duration_minutes'].fillna(0) + work_df['duration_seasons'].fillna(0) * 20
        )
        f_cols.append('duration_value')

        X = work_df[f_cols].fillna(0)
        y = work_df['type']
        self.feature_names = f_cols
        return X, y

    def train_rf_only(self):
        if 'Random Forest' in self.models:
            return self.models['Random Forest']['model']
        X, y = self._prepare_features()
        if not hasattr(self.label_encoder, 'classes_') or len(self.label_encoder.classes_) == 0:
            encoded_targets = self.label_encoder.fit_transform(y)
        else:
            encoded_targets = self.label_encoder.transform(y)

        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, encoded_targets, test_size=0.2, random_state=42, stratify=encoded_targets
        )

        rf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=1)
        rf.fit(self.X_train, self.y_train)
        self.models['Random Forest'] = {'model': rf, 'scaler': None}
        return rf

    def train_models(self):
        X, y = self._prepare_features()
        encoded_targets = self.label_encoder.fit_transform(y)

        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, encoded_targets, test_size=0.2, random_state=42, stratify=encoded_targets
        )

        scaler = StandardScaler()
        X_train_norm = scaler.fit_transform(self.X_train)
        X_test_norm = scaler.transform(self.X_test)

        algo_pool = {
            'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=1),
            'Gradient Boosting': GradientBoostingClassifier(n_estimators=60, max_depth=4, random_state=42),
            'Logistic Regression': LogisticRegression(max_iter=500, C=1.0, random_state=42),
            'SVM': SVC(kernel='rbf', C=1.0, max_iter=1500, random_state=42),
            'KNN': KNeighborsClassifier(n_neighbors=5, n_jobs=1),
        }

        eval_summary = {}

        for name, clf in algo_pool.items():
            needs_scale = name in ['Logistic Regression', 'SVM', 'KNN']
            train_feats = X_train_norm if needs_scale else self.X_train
            test_feats = X_test_norm if needs_scale else self.X_test

            clf.fit(train_feats, self.y_train)
            test_preds = clf.predict(test_feats)

            # 3-fold cross validation with n_jobs=1 to prevent Windows multiprocessing deadlock
            cv_accs = cross_val_score(clf, train_feats, self.y_train, cv=3, scoring='accuracy', n_jobs=1)

            eval_summary[name] = {
                'accuracy': round(float(accuracy_score(self.y_test, test_preds)) * 100, 2),
                'precision': round(float(precision_score(self.y_test, test_preds, average='weighted')) * 100, 2),
                'recall': round(float(recall_score(self.y_test, test_preds, average='weighted')) * 100, 2),
                'f1': round(float(f1_score(self.y_test, test_preds, average='weighted')) * 100, 2),
                'cv_mean': round(float(cv_accs.mean()) * 100, 2),
                'cv_std': round(float(cv_accs.std()) * 100, 2),
            }

            self.models[name] = {
                'model': clf,
                'scaler': scaler if needs_scale else None
            }

        self.results = eval_summary
        self.trained = True
        return {'models': eval_summary, 'classes': list(self.label_encoder.classes_)}

    def get_feature_importance(self):
        if 'Random Forest' not in self.models:
            self.train_rf_only()
        rf_model = self.models['Random Forest']['model']
        scores = rf_model.feature_importances_

        # rank features descending
        sorted_indices = np.argsort(scores)[::-1][:15]
        top_names = [self.feature_names[i] for i in sorted_indices]
        top_scores = [round(float(scores[i]), 4) for i in sorted_indices]

        return {'features': top_names, 'importances': top_scores}

    def get_confusion_matrix(self, model_name='Random Forest'):
        if not self.trained and model_name not in self.models:
            self.train_rf_only()
        model_info = self.models.get(model_name, self.models.get('Random Forest'))
        estimator = model_info['model']

        eval_inputs = self.X_test
        if model_info['scaler']:
            eval_inputs = model_info['scaler'].transform(self.X_test)

        preds = estimator.predict(eval_inputs)
        matrix = confusion_matrix(self.y_test, preds)

        return {
            'matrix': matrix.tolist(),
            'classes': list(self.label_encoder.classes_)
        }

    def predict_single(self, user_inputs):
        if 'Random Forest' not in self.models:
            self.train_rf_only()

        rf_clf = self.models['Random Forest']['model']

        # populate default zeroes across all known features
        sample_row = {fn: 0 for fn in self.feature_names}

        sample_row['release_year'] = int(user_inputs.get('release_year', 2020))
        sample_row['year_added'] = int(user_inputs.get('year_added', 2021))
        sample_row['month_added'] = int(user_inputs.get('month_added', 6))
        sample_row['genre_count'] = int(user_inputs.get('genre_count', 2))
        
        rating_val = str(user_inputs.get('rating', 'TV-MA'))
        if hasattr(self, 'rating_encoder') and rating_val in self.rating_encoder.classes_:
            sample_row['rating_encoded'] = int(self.rating_encoder.transform([rating_val])[0])
        else:
            sample_row['rating_encoded'] = int(user_inputs.get('rating_encoded', 3))

        sample_row['duration_value'] = float(user_inputs.get('duration', 90))
        sample_row['content_age'] = max(0, sample_row['year_added'] - sample_row['release_year'])

        ref_date = pd.to_datetime('2008-01-01')
        approx_date = pd.to_datetime(f"{sample_row['year_added']}-{sample_row['month_added']:02d}-01", errors='coerce')
        if pd.isna(approx_date):
            approx_date = ref_date
        sample_row['days_to_add'] = max(0, (approx_date - ref_date).days)

        origin_country = user_inputs.get('country', '')
        country_col = f"country_{origin_country.replace(' ', '_').lower()}"
        if country_col in sample_row:
            sample_row[country_col] = 1

        selected_genre = user_inputs.get('genre', '')
        genre_col = f"genre_{selected_genre.lower()}"
        if genre_col in sample_row:
            sample_row[genre_col] = 1

        eval_vector = np.array([sample_row[fn] for fn in self.feature_names]).reshape(1, -1)
        pred_idx = rf_clf.predict(eval_vector)[0]
        prob_dist = rf_clf.predict_proba(eval_vector)[0]
        label_text = self.label_encoder.inverse_transform([pred_idx])[0]

        probs_by_class = {}
        for class_label, probability in zip(self.label_encoder.classes_, prob_dist):
            probs_by_class[class_label] = round(float(probability) * 100, 1)

        return {
            'prediction': label_text,
            'confidence': round(float(max(prob_dist)) * 100, 1),
            'probabilities': probs_by_class
        }

    def generate_insights(self):
        catalog = self.df
        findings = []

        # 1. content split
        movie_pct = round((catalog['type'] == 'Movie').mean() * 100, 1)
        findings.append({
            'category': 'Content Mix',
            'icon': '🎬',
            'title': f'Movies make up {movie_pct}% of the catalog',
            'detail': f'The catalog splits into {movie_pct}% Movies and {100-movie_pct}% TV Shows, showing a strong focus on standalone films.',
            'priority': 'high'
        })

        # 2. catalog growth milestone
        recent_additions = catalog[catalog['year_added'] >= 2018]
        prior_additions = catalog[catalog['year_added'] < 2018]
        if len(prior_additions) > 0:
            growth_pct = round(len(recent_additions) / max(len(prior_additions), 1) * 100, 0)
            findings.append({
                'category': 'Growth',
                'icon': '📈',
                'title': f'{int(growth_pct)}% volume increase after 2018',
                'detail': 'Content acquisition escalated steeply starting in 2018, marking a transition toward massive global streaming volume.',
                'priority': 'high'
            })

        # 3. primary content producer
        top_country = catalog['country'].value_counts().idxmax()
        country_share = round(catalog['country'].value_counts().iloc[0] / len(catalog) * 100, 1)
        findings.append({
            'category': 'Geographic',
            'icon': '🌍',
            'title': f'{top_country} leads catalog production ({country_share}%)',
            'detail': f'{top_country} accounts for {country_share}% of all entries, while international hubs like India and the UK represent the fastest secondary contributors.',
            'priority': 'medium'
        })

        # 4. common genre trends
        exploded_genres = catalog['listed_in'].dropna().str.split(',').explode().str.strip()
        leading_genre = exploded_genres.value_counts().idxmax()
        findings.append({
            'category': 'Genre',
            'icon': '🎭',
            'title': f'"{leading_genre}" is the most frequent tag',
            'detail': f'{leading_genre} tags appear most consistently across both films and series, serving as the core anchor for subscriber engagement.',
            'priority': 'medium'
        })

        # 5. typical film duration
        avg_runtime = round(catalog['duration_minutes'].dropna().mean(), 0)
        findings.append({
            'category': 'Duration',
            'icon': '⏱️',
            'title': f'Average movie length: {int(avg_runtime)} minutes',
            'detail': f'Movie runtimes hover near {int(avg_runtime)} minutes, adhering closely to standard commercial theatrical lengths.',
            'priority': 'low'
        })

        # 6. global content expansion
        non_us_share = round((catalog['country'] != 'United States').mean() * 100, 1)
        findings.append({
            'category': 'Diversity',
            'icon': '🌐',
            'title': f'{non_us_share}% international production share',
            'detail': f'Titles produced outside the United States account for {non_us_share}% of the library, reflecting international market expansion.',
            'priority': 'high'
        })

        # 7. maturity ratings
        lead_rating = catalog['rating'].value_counts().idxmax()
        lead_rating_share = round(catalog['rating'].value_counts().iloc[0] / len(catalog) * 100, 1)
        findings.append({
            'category': 'Audience',
            'icon': '👥',
            'title': f'"{lead_rating}" represents {lead_rating_share}% of titles',
            'detail': f'Mature viewer categories hold the plurality of catalog titles, matching adult-centric subscriber demographics.',
            'priority': 'medium'
        })

        # 8. catalog freshness
        recent_release_pct = round((catalog['content_age'] <= 1).mean() * 100, 1)
        findings.append({
            'category': 'Freshness',
            'icon': '✨',
            'title': f'{recent_release_pct}% added within a year of premiere',
            'detail': 'A sizable portion of acquisitions is added within 12 months of initial theatrical or broadcast release.',
            'priority': 'medium'
        })

        return findings
