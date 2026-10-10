import warnings
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import PCA
from sklearn.impute import SimpleImputer
from sklearn.metrics import pairwise_distances_argmin_min, silhouette_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

warnings.filterwarnings('ignore')


class ClusteringService:
    def __init__(self):
        self.last_results = None
        self.clustered_df = None
        self.cached_k_evaluations = None
        self.cached_dataset_len = None

    def clean_data(self, catalog):
        audit = {
            'original_rows': len(catalog),
            'duplicates_removed': 0,
            'missing_values_handled': 0
        }

        # drop exact duplicates
        start_count = len(catalog)
        catalog = catalog.drop_duplicates()
        audit['duplicates_removed'] = start_count - len(catalog)

        # replace whitespace placeholders with np.nan
        catalog = catalog.replace(r'^\s*$', np.nan, regex=True)
        audit['missing_values_handled'] = int(catalog.isnull().sum().sum())

        # fill blank text columns with 'Unknown' so string operations don't fail
        for str_col in catalog.select_dtypes(include=['object', 'category']).columns:
            catalog[str_col] = catalog[str_col].fillna('Unknown').astype(str).str.strip()

        audit['cleaned_rows'] = len(catalog)
        return catalog, audit

    def engineer_features(self, catalog):
        features = pd.DataFrame(index=catalog.index)

        # extract team sizes and tag counts
        for field, target in [('cast', 'cast_count'), ('director', 'director_count'), ('country', 'country_count'), ('listed_in', 'genre_count')]:
            if field in catalog.columns:
                features[target] = catalog[field].apply(lambda v: 0 if v == 'Unknown' else len(str(v).split(',')))

        # separate movie minutes from tv series seasons
        if 'duration' in catalog.columns and 'type' in catalog.columns:
            features['duration_minutes'] = catalog.apply(
                lambda r: int(str(r['duration']).replace(' min', '').strip())
                if r['type'] == 'Movie' and 'min' in str(r['duration']) else np.nan,
                axis=1
            )
            features['duration_seasons'] = catalog.apply(
                lambda r: int(str(r['duration']).replace(' Seasons', '').replace(' Season', '').strip())
                if r['type'] == 'TV Show' and 'Season' in str(r['duration']) else np.nan,
                axis=1
            )

        # extract date added year and month
        if 'date_added' in catalog.columns:
            date_objs = pd.to_datetime(catalog['date_added'].replace('Unknown', np.nan), errors='coerce')
            features['date_added_year'] = date_objs.dt.year
            features['date_added_month'] = date_objs.dt.month

        if 'description' in catalog.columns:
            features['description_length'] = catalog['description'].apply(lambda d: len(str(d)) if d != 'Unknown' else 0)

        if 'release_year' in catalog.columns:
            features['release_year'] = pd.to_numeric(catalog['release_year'], errors='coerce')

        # grab primary category indicators
        if 'type' in catalog.columns:
            features['type'] = catalog['type']
        if 'rating' in catalog.columns:
            features['rating'] = catalog['rating']
        if 'listed_in' in catalog.columns:
            features['primary_genre'] = catalog['listed_in'].apply(lambda g: str(g).split(',')[0].strip() if g != 'Unknown' else 'Unknown')
        if 'country' in catalog.columns:
            features['primary_country'] = catalog['country'].apply(lambda c: str(c).split(',')[0].strip() if c != 'Unknown' else 'Unknown')

        return features

    def evaluate_k(self, feature_matrix, k_range=range(2, 11)):
        evals = []
        max_valid_k = min(10, feature_matrix.shape[0] - 1)
        sub_sample = 500 if feature_matrix.shape[0] > 500 else None

        for k in [val for val in k_range if val <= max_valid_k]:
            km = KMeans(n_clusters=k, random_state=42, n_init=3)
            labels = km.fit_predict(feature_matrix)

            try:
                sil = silhouette_score(feature_matrix, labels, sample_size=sub_sample, random_state=42)
            except Exception:
                sil = 0.0

            evals.append({
                'k': k,
                'inertia': float(km.inertia_),
                'silhouette_score': float(sil)
            })

        return evals

    def perform_clustering(self, raw_catalog, n_clusters=4):
        k_val = int(n_clusters)
        if len(raw_catalog) < k_val:
            return {'error': f'Dataset size ({len(raw_catalog)}) too small for {k_val} clusters'}

        clean_catalog, audit_stats = self.clean_data(raw_catalog.copy())
        feature_set = self.engineer_features(clean_catalog)

        num_cols = feature_set.select_dtypes(include=['int64', 'float64']).columns.tolist()
        cat_cols = feature_set.select_dtypes(include=['object', 'category']).columns.tolist()

        pipe_steps = []
        if num_cols:
            pipe_steps.append(('num', Pipeline([
                ('imputer', SimpleImputer(strategy='median')),
                ('scaler', StandardScaler())
            ]), num_cols))

        if cat_cols:
            pipe_steps.append(('cat', Pipeline([
                ('imputer', SimpleImputer(strategy='constant', fill_value='Unknown')),
                ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
            ]), cat_cols))

        preprocessor = ColumnTransformer(transformers=pipe_steps)

        try:
            processed_matrix = preprocessor.fit_transform(feature_set)
        except Exception as proc_err:
            return {'error': f'Preprocessing failed: {str(proc_err)}'}

        if processed_matrix.shape[1] == 0:
            return {'error': 'No numeric or categorical features available'}

        # cache elbow/silhouette curve if dataset hasn't changed
        if self.cached_k_evaluations is None or self.cached_dataset_len != len(raw_catalog):
            self.cached_k_evaluations = self.evaluate_k(processed_matrix, range(2, 11))
            self.cached_dataset_len = len(raw_catalog)

        # fit final clusters
        km_model = KMeans(n_clusters=k_val, random_state=42, n_init=3)
        assigned_clusters = km_model.fit_predict(processed_matrix)

        try:
            sample_cap = 800 if processed_matrix.shape[0] > 800 else None
            overall_silhouette = float(silhouette_score(processed_matrix, assigned_clusters, sample_size=sample_cap, random_state=42))
        except Exception:
            overall_silhouette = 0.0

        # pca reduction to 2d space for scatter plot
        pca_coords = PCA(n_components=2).fit_transform(processed_matrix)

        # cap scatter points to 800 so browser canvas/svg doesn't lag
        n_items = len(assigned_clusters)
        sample_step = max(1, n_items // 800) if n_items > 800 else 1
        scatter_sample_indices = list(range(0, n_items, sample_step))

        scatter_points = []
        for idx in scatter_sample_indices:
            pt = {
                'id': idx,
                'x': round(float(pca_coords[idx, 0]), 3),
                'y': round(float(pca_coords[idx, 1]), 3),
                'cluster': int(assigned_clusters[idx])
            }
            if 'title' in clean_catalog.columns:
                pt['title'] = str(clean_catalog['title'].iloc[idx])
            if 'type' in clean_catalog.columns:
                pt['type'] = str(clean_catalog['type'].iloc[idx])
            if 'release_year' in clean_catalog.columns:
                pt['year'] = str(clean_catalog['release_year'].iloc[idx])
            if 'rating' in clean_catalog.columns:
                pt['rating'] = str(clean_catalog['rating'].iloc[idx])
            if 'listed_in' in clean_catalog.columns:
                pt['genre'] = str(clean_catalog['listed_in'].iloc[idx]).split(',')[0].strip()
            scatter_points.append(pt)

        clean_catalog['Cluster'] = assigned_clusters
        feature_set['Cluster'] = assigned_clusters
        self.clustered_df = clean_catalog

        cluster_profiles = []
        text_insights = []

        for cid in range(k_val):
            mask = clean_catalog['Cluster'] == cid
            cluster_rows = clean_catalog[mask]
            cluster_feats = feature_set[feature_set['Cluster'] == cid]

            c_size = len(cluster_rows)
            share_pct = (c_size / len(clean_catalog)) * 100

            n_movies = len(cluster_rows[cluster_rows['type'] == 'Movie']) if 'type' in cluster_rows.columns else 0
            n_shows = len(cluster_rows[cluster_rows['type'] == 'TV Show']) if 'type' in cluster_rows.columns else 0
            film_share = (n_movies / c_size * 100) if c_size > 0 else 0
            show_share = (n_shows / c_size * 100) if c_size > 0 else 0

            avg_yr = cluster_rows['release_year'].mean() if 'release_year' in cluster_rows.columns else None
            med_yr = cluster_rows['release_year'].median() if 'release_year' in cluster_rows.columns else None

            avg_mins = cluster_feats['duration_minutes'].mean() if 'duration_minutes' in cluster_feats.columns else None
            avg_szns = cluster_feats['duration_seasons'].mean() if 'duration_seasons' in cluster_feats.columns else None

            # get top tags helper
            def top_frequencies(col_name):
                if col_name in cluster_rows.columns:
                    tokens = cluster_rows[col_name].dropna().astype(str).str.split(',').explode().str.strip()
                    tokens = tokens[tokens != 'Unknown']
                    return tokens.value_counts().head(3).to_dict()
                return {}

            dominant_genres = top_frequencies('listed_in')
            dominant_countries = top_frequencies('country')
            dominant_ratings = top_frequencies('rating')

            cluster_profiles.append({
                'cluster_id': cid,
                'size': c_size,
                'percentage': float(share_pct),
                'movie_percentage': float(film_share),
                'tv_percentage': float(show_share),
                'average_release_year': float(avg_yr) if pd.notnull(avg_yr) else None,
                'median_release_year': float(med_yr) if pd.notnull(med_yr) else None,
                'average_duration_minutes': float(avg_mins) if pd.notnull(avg_mins) else None,
                'average_seasons': float(avg_szns) if pd.notnull(avg_szns) else None,
                'top_genres': dominant_genres,
                'top_countries': dominant_countries,
                'top_ratings': dominant_ratings
            })

            text_insights.append(f"Cluster {cid} contains {share_pct:.1f}% of catalog ({c_size} titles).")
            if film_share > 80:
                text_insights.append(f"Cluster {cid} consists predominantly of Movies ({film_share:.1f}%).")
            elif show_share > 80:
                text_insights.append(f"Cluster {cid} consists predominantly of TV Shows ({show_share:.1f}%).")

            if dominant_genres:
                lead_g = list(dominant_genres.keys())[0]
                text_insights.append(f"Top genre in Cluster {cid} is {lead_g}.")

        # find closest actual title to each centroid
        centroid_titles = []
        try:
            closest_indices, _ = pairwise_distances_argmin_min(km_model.cluster_centers_, processed_matrix)
            for cid, row_idx in enumerate(closest_indices):
                title_str = str(clean_catalog.iloc[row_idx]['title']) if 'title' in clean_catalog.columns else f"Title {row_idx}"
                centroid_titles.append({
                    'cluster_id': cid,
                    'title': title_str,
                    'index': int(row_idx)
                })
        except Exception:
            pass

        self.last_results = {
            'success': True,
            'cleaning_stats': audit_stats,
            'metrics': {
                'n_clusters': k_val,
                'inertia': float(km_model.inertia_),
                'silhouette_score': overall_silhouette
            },
            'k_evaluations': self.cached_k_evaluations,
            'visualization': scatter_points,
            'profiles': cluster_profiles,
            'representative_titles': centroid_titles,
            'insights': text_insights
        }

        return self.last_results


clustering_service = ClusteringService()
