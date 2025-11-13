import joblib
import os

class SVMFormClassifier:
    def __init__(self):
        base_path = os.path.join(os.path.dirname(__file__), '..', 'ml_models')
        
        self.models = {
            'pushup': joblib.load(os.path.join(base_path, 'svm_pushup.pkl')),
            'squat': joblib.load(os.path.join(base_path, 'svm_squat.pkl'))
        }
        
        self.scalers = {
            'pushup': joblib.load(os.path.join(base_path, 'scaler_pushup.pkl')),
            'squat': joblib.load(os.path.join(base_path, 'scaler_squat.pkl'))
        }
        
        print("✅ SVM loaded!")
    
    def predict_form(self, exercise_type, angles):
        exercise = exercise_type.lower()
        if exercise not in self.models:
            return {'error': f'No model for {exercise}'}
        
        angles_scaled = self.scalers[exercise].transform([angles])
        prediction = self.models[exercise].predict(angles_scaled)[0]
        confidence = self.models[exercise].decision_function(angles_scaled)[0]
        
        return {
            'prediction': 'good' if prediction == 1 else 'bad',
            'confidence': float(confidence),
            'is_good_form': bool(prediction == 1)
        }