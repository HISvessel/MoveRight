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

# Test property setters
print("\n" + "="*50)
print("Testing Property Setters...")
print("="*50)

print(f"\nCurrent values: age={user.age}, feet={user.feet}, inches={user.inches}, weight={user.weight}")

# Test age setter
print("\nTrying to change age from 25 to 30...")
try:
    user.age = 30
    print(f"✓ Age changed to: {user.age}")
except RecursionError:
    print(f"❌ INFINITE RECURSION ERROR in age setter!")
except Exception as e:
    print(f"❌ ERROR: {e}")

# Test feet setter
print("\nTrying to change feet from 5 to 6...")
try:
    user.feet = 6
    print(f"✓ Feet changed to: {user.feet}")
except RecursionError:
    print(f"❌ INFINITE RECURSION ERROR in feet setter!")
except Exception as e:
    print(f"❌ ERROR: {e}")

# Test inches setter
print("\nTrying to change inches from 10 to 8...")
try:
    user.inches = 8
    print(f"✓ Inches changed to: {user.inches}")
except RecursionError:
    print(f"❌ INFINITE RECURSION ERROR in inches setter!")
except Exception as e:
    print(f"❌ ERROR: {e}")

# Test weight setter
print("\nTrying to change weight from 170 to 175...")
try:
    user.weight = 175
    print(f"✓ Weight changed to: {user.weight}")
except RecursionError:
    print(f"❌ INFINITE RECURSION ERROR in weight setter!")
except Exception as e:
    print(f"❌ ERROR: {e}")

print("\n" + "="*50)
print("If you see RECURSION errors, the setters need fixing!")
print("="*50)

