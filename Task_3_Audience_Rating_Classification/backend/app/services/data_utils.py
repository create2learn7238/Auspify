import os
import joblib
import numpy as np
import pandas as pd

# dataset path resolution
repo_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dataset_csv = os.path.join(repo_root, 'data', 'Dataset.csv')


def get_dashboard_stats():
    try:
        catalog = pd.read_csv(dataset_csv).dropna(subset=['rating'])
        total_records = len(catalog)
        num_classes = catalog['rating'].nunique()

        # baseline train-test record estimate
        train_count = int(total_records * 0.8)
        test_count = total_records - train_count

        # tuned random forest final cv metrics
        rating_tallies = catalog['rating'].value_counts().head(12)
        rating_bar_list = [
            {'rating': r_name, 'count': int(r_val)}
            for r_name, r_val in zip(rating_tallies.index, rating_tallies.values)
        ]

        return {
            'total_titles': f'{total_records:,}',
            'rating_categories': num_classes,
            'train_samples': f'{train_count:,}',
            'test_samples': f'{test_count:,}',
            'final_accuracy': '54.38%',
            'final_f1': '51.87%',
            'ratings_data': rating_bar_list
        }
    except Exception as err:
        return {'error': str(err)}


def get_analytics_data():
    try:
        catalog = pd.read_csv(dataset_csv).dropna(subset=['rating'])

        # movie vs tv show distribution
        type_dist = catalog['type'].value_counts()
        type_payload = {'labels': type_dist.index.tolist(), 'values': type_dist.values.tolist()}

        # ratings frequency breakdown
        top_ratings = catalog['rating'].value_counts().head(10)
        rating_payload = {'labels': top_ratings.index.tolist(), 'values': top_ratings.values.tolist()}

        # modern release timeline
        post_2000 = catalog[catalog['release_year'] >= 2000]
        timeline = post_2000['release_year'].value_counts().sort_index()
        year_payload = {'labels': timeline.index.tolist(), 'values': timeline.values.tolist()}

        # exploded genre counts
        top_genres = catalog['listed_in'].str.split(',').explode().str.strip().value_counts().head(10)
        genre_payload = {'labels': top_genres.index.tolist(), 'values': top_genres.values.tolist()}

        # top producer countries
        top_origins = catalog['country'].str.split(',').explode().str.strip().value_counts().head(10)
        country_payload = {'labels': top_origins.index.tolist(), 'values': top_origins.values.tolist()}

        return {
            'type_data': type_payload,
            'rating_data': rating_payload,
            'year_data': year_payload,
            'genre_data': genre_payload,
            'country_data': country_payload
        }
    except Exception as err:
        return {'error': str(err)}


def get_model_comparison_data():
    # static benchmark scores across experimental model runs
    return {
        'labels': ['Accuracy', 'Macro F1', 'Weighted F1'],
        'datasets': [
            {
                'label': 'Decision Tree (Base)',
                'data': [0.4772, 0.2896, 0.4699],
                'backgroundColor': 'rgba(255, 99, 132, 0.6)'
            },
            {
                'label': 'Decision Tree (Tuned)',
                'data': [0.5017, 0.2903, 0.4803],
                'backgroundColor': 'rgba(255, 99, 132, 1.0)'
            },
            {
                'label': 'Random Forest (Base)',
                'data': [0.5512, 0.3529, 0.5280],
                'backgroundColor': 'rgba(54, 162, 235, 0.6)'
            },
            {
                'label': 'Random Forest (Tuned)',
                'data': [0.5438, 0.3294, 0.5187],
                'backgroundColor': 'rgba(54, 162, 235, 1.0)'
            }
        ]
    }


def get_feature_importance():
    try:
        model_file = os.path.join(repo_root, 'models', 'random_forest_tuned.pkl')
        fitted_pipe = joblib.load(model_file)

        raw_feat_names = fitted_pipe.named_steps['preprocessor'].get_feature_names_out()
        gini_scores = fitted_pipe.named_steps['classifier'].feature_importances_

        # clean up transformer prefix (e.g. cat__ or num__)
        clean_labels = []
        for raw_name in raw_feat_names:
            short_tag = raw_name.split('__')[-1]
            if len(short_tag) > 25:
                short_tag = short_tag[:25] + '...'
            clean_labels.append(short_tag)

        # grab top 15 features by gini score
        best_indices = np.argsort(gini_scores)[::-1][:15]

        return {
            'labels': [clean_labels[idx] for idx in best_indices],
            'values': [float(gini_scores[idx]) for idx in best_indices]
        }
    except Exception as err:
        return {'labels': [], 'values': []}


def get_form_options():
    try:
        catalog = pd.read_csv(dataset_csv)

        # extract unique sorted dropdown values
        country_set = sorted(catalog['country'].dropna().str.split(',').explode().str.strip().unique().tolist())
        genre_set = sorted(catalog['listed_in'].dropna().str.split(',').explode().str.strip().unique().tolist())
        type_set = sorted(catalog['type'].dropna().unique().tolist())
        director_set = sorted(catalog['director'].dropna().str.split(',').explode().str.strip().unique().tolist())

        return {
            'countries': country_set,
            'genres': genre_set,
            'types': type_set,
            'directors': director_set
        }
    except Exception:
        return {'countries': [], 'genres': [], 'types': [], 'directors': []}
