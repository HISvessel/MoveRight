from app.models.review import Review
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

title_string = 'Absolutely love this app'
rating_comment = 'This app is great'

review1 = Review(
    title=title_string, comment=rating_comment, rating=2
)

print('Testing the review method...')
print()

print(f"The customer says this: {review1.title}")
print(f"The customer hassss this to saay about Move Right: {review1.comment}")
print(f"The customer rated Move Right as a {review1.rating} out of 5")

print("Testing complete. No errors are given.")