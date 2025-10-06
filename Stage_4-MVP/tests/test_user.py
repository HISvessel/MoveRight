import sys
import os
import bcrypt
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models.user import User

# Quick manual test
print("Testing User class...\n")

user = User(
    first_name='Joe',
    last_name='G',
    email='test@yahoo.com',
    password='TestPass123',
    age=25,
    feet=5,
    inches=10,
    weight=170
)

user2 = User(
    first_name='Jean',
    last_name='Caraballo',
    email='test@yahoo.com',
    password='halcyon',
    age='34',
    feet='String',
    inches=True,
    weight=[23]
)

print(f"✓ Created user: {user.first_name} {user.last_name}")
print(f"✓ ID: {user.id}")
print(f"✓ Password hashed: {type(user._password)}")
print(f"✓ Password verification (correct): {user.verify_password('TestPass123')}")
print(f"✓ Password verification (wrong): {user.verify_password('WrongPass')}")
print(f"✓ Email validation (yahoo): {user.verify_email('test@yahoo.com')}")
print(f"✓ Email validation (gmail): {user.verify_email('test@gmail.com')}")
print(f"✓ Validation errors: {user.validate_account()}")



print()
print('Testing the second user...\n')


print(f"✓ Created user: {user2.first_name} {user2.last_name}")
print(f"✓ ID: {user2.id}")
print(f"✓ Password hashed: {type(user2._password)}")
print(f"✓ Password verification (correct): {user2.verify_password('TestPass123')}")
print(f"✓ Password verification (wrong): {user2.verify_password('WrongPass')}")
print(f"✓ Email validation (yahoo): {user2.verify_email('test@yahoo.com')}")
print(f"✓ Email validation (gmail): {user2.verify_email('test@gmail.com')}")
print(f"✓ Validation errors: {user2.validate_account()}")
print(f"{user2.first_name} is {user2.age}years old, weights {user2.weight}lbs and is {user2.feet}' {user2.inches}'' tall")