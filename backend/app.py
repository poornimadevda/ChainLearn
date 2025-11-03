"""
Flask Backend API for ChainLearn - Blockchain Certificate Management System
MongoDB Version
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from bson import ObjectId
from bson.errors import InvalidId
import os

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

# Enable CORS for Next.js frontend
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

# Initialize MongoDB
from database import init_db, get_db, close_db
from models import COLLECTIONS, serialize_doc, serialize_list
from blockchain_utils import generate_certificate_hash, submit_to_blockchain, verify_certificate_hash, get_blockchain_stats

# Initialize database on startup
init_db()

# Helper functions
def get_collection(name):
    """Get MongoDB collection"""
    db = get_db()
    return db[COLLECTIONS[name]]

def to_object_id(id_str):
    """Convert string to ObjectId"""
    try:
        return ObjectId(id_str)
    except (InvalidId, TypeError):
        return None

# ==================== Authentication Routes ====================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login endpoint"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    users_collection = get_collection('users')
    
    # Find user by email
    user = users_collection.find_one({'email': email})
    
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Verify password (hash it and compare)
    import hashlib
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    if user['password_hash'] != password_hash:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    user = serialize_doc(user)
    
    return jsonify({
        'success': True,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'role': user['role']
        },
        'token': 'demo_token_' + user['id']  # In production, use JWT
    }), 200

# ==================== User Routes ====================

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    users_collection = get_collection('users')
    users = list(users_collection.find())
    users = serialize_list(users)
    return jsonify([{
        'id': u['id'],
        'email': u['email'],
        'name': u['name'],
        'role': u['role']
    } for u in users]), 200

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID"""
    users_collection = get_collection('users')
    user_id_obj = to_object_id(user_id)
    if not user_id_obj:
        return jsonify({'error': 'Invalid user ID'}), 400
    
    user = users_collection.find_one({'_id': user_id_obj})
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user = serialize_doc(user)
    return jsonify({
        'id': user['id'],
        'email': user['email'],
        'name': user['name'],
        'role': user['role']
    }), 200

# ==================== Course Routes ====================

@app.route('/api/courses', methods=['GET'])
def get_courses():
    """Get all courses"""
    courses_collection = get_collection('courses')
    users_collection = get_collection('users')
    
    courses = list(courses_collection.find())
    courses_data = []
    
    for course in courses:
        course = serialize_doc(course)
        instructor = None
        if course.get('instructor_id'):
            instructor_id_obj = to_object_id(course['instructor_id'])
            if instructor_id_obj:
                instructor = users_collection.find_one({'_id': instructor_id_obj})
                instructor = serialize_doc(instructor) if instructor else None
        
        courses_data.append({
            'id': course['id'],
            'name': course['name'],
            'description': course.get('description', ''),
            'instructor_id': course.get('instructor_id'),
            'instructor_name': instructor['name'] if instructor else None,
            'created_at': course.get('created_at'),
            'student_count': 0  # Can be calculated from grades/certificates
        })
    
    return jsonify(courses_data), 200

@app.route('/api/courses', methods=['POST'])
def create_course():
    """Create a new course"""
    data = request.json
    courses_collection = get_collection('courses')
    
    course_data = {
        'name': data.get('name'),
        'description': data.get('description', ''),
        'instructor_id': data.get('instructor_id'),
        'created_at': datetime.utcnow()
    }
    
    result = courses_collection.insert_one(course_data)
    course_data['_id'] = result.inserted_id
    course = serialize_doc(course_data)
    
    return jsonify({
        'id': course['id'],
        'name': course['name'],
        'description': course.get('description', ''),
        'instructor_id': course.get('instructor_id')
    }), 201

@app.route('/api/courses/<course_id>', methods=['GET'])
def get_course(course_id):
    """Get course by ID"""
    courses_collection = get_collection('courses')
    users_collection = get_collection('users')
    
    course_id_obj = to_object_id(course_id)
    if not course_id_obj:
        return jsonify({'error': 'Invalid course ID'}), 400
    
    course = courses_collection.find_one({'_id': course_id_obj})
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    course = serialize_doc(course)
    instructor = None
    if course.get('instructor_id'):
        instructor_id_obj = to_object_id(course['instructor_id'])
        if instructor_id_obj:
            instructor = users_collection.find_one({'_id': instructor_id_obj})
            instructor = serialize_doc(instructor) if instructor else None
    
    return jsonify({
        'id': course['id'],
        'name': course['name'],
        'description': course.get('description', ''),
        'instructor_id': course.get('instructor_id'),
        'instructor_name': instructor['name'] if instructor else None
    }), 200

@app.route('/api/courses/<course_id>', methods=['PUT'])
def update_course(course_id):
    """Update course"""
    courses_collection = get_collection('courses')
    course_id_obj = to_object_id(course_id)
    if not course_id_obj:
        return jsonify({'error': 'Invalid course ID'}), 400
    
    course = courses_collection.find_one({'_id': course_id_obj})
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    data = request.json
    update_data = {}
    
    if 'name' in data:
        update_data['name'] = data['name']
    if 'description' in data:
        update_data['description'] = data.get('description', '')
    if 'instructor_id' in data:
        update_data['instructor_id'] = data['instructor_id']
    
    courses_collection.update_one({'_id': course_id_obj}, {'$set': update_data})
    course = courses_collection.find_one({'_id': course_id_obj})
    course = serialize_doc(course)
    
    return jsonify({
        'id': course['id'],
        'name': course['name'],
        'description': course.get('description', ''),
        'instructor_id': course.get('instructor_id')
    }), 200

@app.route('/api/courses/<course_id>', methods=['DELETE'])
def delete_course(course_id):
    """Delete course"""
    courses_collection = get_collection('courses')
    course_id_obj = to_object_id(course_id)
    if not course_id_obj:
        return jsonify({'error': 'Invalid course ID'}), 400
    
    result = courses_collection.delete_one({'_id': course_id_obj})
    if result.deleted_count == 0:
        return jsonify({'error': 'Course not found'}), 404
    
    return jsonify({'message': 'Course deleted successfully'}), 200

# ==================== Certificate Routes ====================

@app.route('/api/certificates', methods=['GET'])
def get_certificates():
    """Get all certificates"""
    certificates_collection = get_collection('certificates')
    users_collection = get_collection('users')
    courses_collection = get_collection('courses')
    
    query = {}
    course_id = request.args.get('course_id')
    student_id = request.args.get('student_id')
    
    if course_id:
        course_id_obj = to_object_id(course_id)
        if course_id_obj:
            query['course_id'] = str(course_id_obj)
    
    if student_id:
        student_id_obj = to_object_id(student_id)
        if student_id_obj:
            query['student_id'] = str(student_id_obj)
    
    certificates = list(certificates_collection.find(query))
    certificates_data = []
    
    for cert in certificates:
        cert = serialize_doc(cert)
        
        student = None
        if cert.get('student_id'):
            student_id_obj = to_object_id(cert['student_id'])
            if student_id_obj:
                student = users_collection.find_one({'_id': student_id_obj})
                student = serialize_doc(student) if student else None
        
        course = None
        if cert.get('course_id'):
            course_id_obj = to_object_id(cert['course_id'])
            if course_id_obj:
                course = courses_collection.find_one({'_id': course_id_obj})
                course = serialize_doc(course) if course else None
        
        certificates_data.append({
            'id': cert['id'],
            'certificate_id': cert.get('certificate_id'),
            'student_id': cert.get('student_id'),
            'student_name': student['name'] if student else None,
            'student_email': student['email'] if student else None,
            'course_id': cert.get('course_id'),
            'course_name': course['name'] if course else None,
            'grade': cert.get('grade'),
            'score': cert.get('score'),
            'issue_date': cert.get('issue_date'),
            'blockchain_hash': cert.get('blockchain_hash'),
            'blockchain_block_number': cert.get('blockchain_block_number'),
            'status': cert.get('status', 'pending'),
            'instructor_name': cert.get('instructor_name')
        })
    
    return jsonify(certificates_data), 200

@app.route('/api/certificates', methods=['POST'])
def create_certificate():
    """Create/issue a new certificate"""
    data = request.json
    certificates_collection = get_collection('certificates')
    
    # Count existing certificates to generate ID
    count = certificates_collection.count_documents({})
    cert_id = f"CERT-{datetime.now().year}-{str(count + 1).zfill(4)}-{data.get('course_name', 'COURSE').upper()[:5]}"
    
    certificate_data = {
        'certificate_id': cert_id,
        'student_id': str(to_object_id(data.get('student_id'))),
        'course_id': str(to_object_id(data.get('course_id'))),
        'grade': data.get('grade'),
        'score': data.get('score'),
        'instructor_name': data.get('instructor_name', 'Dr. Sarah Smith'),
        'issue_date': datetime.utcnow(),
        'status': 'issued',
        'created_at': datetime.utcnow()
    }
    
    result = certificates_collection.insert_one(certificate_data)
    certificate_data['_id'] = result.inserted_id
    cert = serialize_doc(certificate_data)
    
    return jsonify({
        'id': cert['id'],
        'certificate_id': cert['certificate_id'],
        'student_id': cert['student_id'],
        'course_id': cert['course_id'],
        'grade': cert['grade'],
        'score': cert['score'],
        'issue_date': cert['issue_date'],
        'status': cert['status']
    }), 201

@app.route('/api/certificates/<cert_id>/verify', methods=['POST'])
def verify_certificate_blockchain(cert_id):
    """Verify certificate on blockchain"""
    certificates_collection = get_collection('certificates')
    users_collection = get_collection('users')
    courses_collection = get_collection('courses')
    
    cert_id_obj = to_object_id(cert_id)
    if not cert_id_obj:
        return jsonify({'error': 'Invalid certificate ID'}), 400
    
    certificate = certificates_collection.find_one({'_id': cert_id_obj})
    if not certificate:
        return jsonify({'error': 'Certificate not found'}), 404
    
    certificate = serialize_doc(certificate)
    
    if not certificate.get('blockchain_hash'):
        # Get student and course info
        student = None
        course = None
        
        if certificate.get('student_id'):
            student_id_obj = to_object_id(certificate['student_id'])
            if student_id_obj:
                student = users_collection.find_one({'_id': student_id_obj})
                student = serialize_doc(student) if student else None
        
        if certificate.get('course_id'):
            course_id_obj = to_object_id(certificate['course_id'])
            if course_id_obj:
                course = courses_collection.find_one({'_id': course_id_obj})
                course = serialize_doc(course) if course else None
        
        # Submit to blockchain
        hash_result = submit_to_blockchain(
            certificate_id=certificate['certificate_id'],
            student_name=student['name'] if student else '',
            course_name=course['name'] if course else '',
            grade=certificate.get('grade', ''),
            issue_date=certificate.get('issue_date', datetime.utcnow().isoformat()),
            instructor_name=certificate.get('instructor_name', '')
        )
        
        # Update certificate
        certificates_collection.update_one(
            {'_id': cert_id_obj},
            {'$set': {
                'blockchain_hash': hash_result['hash'],
                'blockchain_block_number': hash_result['block_number'],
                'status': 'verified'
            }}
        )
        
        return jsonify({
            'success': True,
            'message': 'Certificate submitted to blockchain and verified',
            'hash': hash_result['hash'],
            'block_number': hash_result['block_number']
        }), 200
    
    # Verify existing certificate
    result = verify_certificate_hash(
        certificate['certificate_id'],
        certificate['blockchain_hash']
    )
    
    return jsonify(result), 200

@app.route('/api/certificates/verify', methods=['POST'])
def verify_certificate_by_id():
    """Verify certificate by ID or hash"""
    data = request.json
    certificates_collection = get_collection('certificates')
    users_collection = get_collection('users')
    courses_collection = get_collection('courses')
    
    cert_id = data.get('certificate_id')
    hash_value = data.get('hash')
    
    if cert_id:
        certificate = certificates_collection.find_one({'certificate_id': cert_id})
        if certificate and certificate.get('blockchain_hash'):
            certificate = serialize_doc(certificate)
            result = verify_certificate_hash(cert_id, certificate['blockchain_hash'])
            
            # Get additional info
            student = None
            course = None
            if certificate.get('student_id'):
                student_id_obj = to_object_id(certificate['student_id'])
                if student_id_obj:
                    student = users_collection.find_one({'_id': student_id_obj})
                    student = serialize_doc(student) if student else None
            if certificate.get('course_id'):
                course_id_obj = to_object_id(certificate['course_id'])
                if course_id_obj:
                    course = courses_collection.find_one({'_id': course_id_obj})
                    course = serialize_doc(course) if course else None
            
            return jsonify({
                **result,
                'certificate': {
                    'certificate_id': certificate['certificate_id'],
                    'student_name': student['name'] if student else None,
                    'course_name': course['name'] if course else None,
                    'issue_date': certificate.get('issue_date'),
                    'grade': certificate.get('grade')
                }
            }), 200
    
    if hash_value:
        certificate = certificates_collection.find_one({'blockchain_hash': hash_value})
        if certificate:
            certificate = serialize_doc(certificate)
            result = verify_certificate_hash(certificate['certificate_id'], hash_value)
            return jsonify({
                **result,
                'certificate': {
                    'certificate_id': certificate['certificate_id'],
                    'student_name': certificate.get('student_name'),
                    'course_name': certificate.get('course_name'),
                    'issue_date': certificate.get('issue_date'),
                    'grade': certificate.get('grade')
                }
            }), 200
    
    return jsonify({
        'isValid': False,
        'message': 'Certificate not found'
    }), 404

@app.route('/api/certificates/<cert_id>', methods=['GET'])
def get_certificate(cert_id):
    """Get certificate by ID"""
    certificates_collection = get_collection('certificates')
    users_collection = get_collection('users')
    courses_collection = get_collection('courses')
    
    cert_id_obj = to_object_id(cert_id)
    if not cert_id_obj:
        return jsonify({'error': 'Invalid certificate ID'}), 400
    
    certificate = certificates_collection.find_one({'_id': cert_id_obj})
    if not certificate:
        return jsonify({'error': 'Certificate not found'}), 404
    
    certificate = serialize_doc(certificate)
    
    student = None
    if certificate.get('student_id'):
        student_id_obj = to_object_id(certificate['student_id'])
        if student_id_obj:
            student = users_collection.find_one({'_id': student_id_obj})
            student = serialize_doc(student) if student else None
    
    course = None
    if certificate.get('course_id'):
        course_id_obj = to_object_id(certificate['course_id'])
        if course_id_obj:
            course = courses_collection.find_one({'_id': course_id_obj})
            course = serialize_doc(course) if course else None
    
    return jsonify({
        'id': certificate['id'],
        'certificate_id': certificate.get('certificate_id'),
        'student_id': certificate.get('student_id'),
        'student_name': student['name'] if student else None,
        'student_email': student['email'] if student else None,
        'course_id': certificate.get('course_id'),
        'course_name': course['name'] if course else None,
        'grade': certificate.get('grade'),
        'score': certificate.get('score'),
        'issue_date': certificate.get('issue_date'),
        'blockchain_hash': certificate.get('blockchain_hash'),
        'blockchain_block_number': certificate.get('blockchain_block_number'),
        'status': certificate.get('status', 'pending'),
        'instructor_name': certificate.get('instructor_name')
    }), 200

# ==================== Grade Routes ====================

@app.route('/api/grades', methods=['GET'])
def get_grades():
    """Get all grades"""
    grades_collection = get_collection('grades')
    users_collection = get_collection('users')
    courses_collection = get_collection('courses')
    
    query = {}
    course_id = request.args.get('course_id')
    student_id = request.args.get('student_id')
    
    if course_id:
        course_id_obj = to_object_id(course_id)
        if course_id_obj:
            query['course_id'] = str(course_id_obj)
    
    if student_id:
        student_id_obj = to_object_id(student_id)
        if student_id_obj:
            query['student_id'] = str(student_id_obj)
    
    grades = list(grades_collection.find(query))
    grades_data = []
    
    for grade in grades:
        grade = serialize_doc(grade)
        
        student = None
        if grade.get('student_id'):
            student_id_obj = to_object_id(grade['student_id'])
            if student_id_obj:
                student = users_collection.find_one({'_id': student_id_obj})
                student = serialize_doc(student) if student else None
        
        course = None
        if grade.get('course_id'):
            course_id_obj = to_object_id(grade['course_id'])
            if course_id_obj:
                course = courses_collection.find_one({'_id': course_id_obj})
                course = serialize_doc(course) if course else None
        
        grades_data.append({
            'id': grade['id'],
            'student_id': grade.get('student_id'),
            'student_name': student['name'] if student else None,
            'student_email': student['email'] if student else None,
            'course_id': grade.get('course_id'),
            'course_name': course['name'] if course else None,
            'grade': grade.get('grade'),
            'score': grade.get('score'),
            'feedback': grade.get('feedback'),
            'submission_date': grade.get('submission_date'),
            'certificate_issued': grade.get('certificate_issued', False)
        })
    
    return jsonify(grades_data), 200

@app.route('/api/grades', methods=['POST'])
def create_grade():
    """Create or update a grade"""
    data = request.json
    grades_collection = get_collection('grades')
    
    student_id_str = str(to_object_id(data.get('student_id')))
    course_id_str = str(to_object_id(data.get('course_id')))
    
    # Check if grade already exists
    existing = grades_collection.find_one({
        'student_id': student_id_str,
        'course_id': course_id_str
    })
    
    if existing:
        # Update existing grade
        update_data = {}
        if 'grade' in data:
            update_data['grade'] = data['grade']
        if 'score' in data:
            update_data['score'] = data['score']
        if 'feedback' in data:
            update_data['feedback'] = data.get('feedback', '')
        update_data['certificate_issued'] = False
        update_data['updated_at'] = datetime.utcnow()
        
        grades_collection.update_one(
            {'_id': existing['_id']},
            {'$set': update_data}
        )
        existing = grades_collection.find_one({'_id': existing['_id']})
        existing = serialize_doc(existing)
        
        return jsonify({
            'id': existing['id'],
            'student_id': existing['student_id'],
            'course_id': existing['course_id'],
            'grade': existing.get('grade'),
            'score': existing.get('score'),
            'feedback': existing.get('feedback')
        }), 200
    
    # Create new grade
    grade_data = {
        'student_id': student_id_str,
        'course_id': course_id_str,
        'grade': data.get('grade'),
        'score': data.get('score'),
        'feedback': data.get('feedback', ''),
        'submission_date': datetime.utcnow(),
        'certificate_issued': False,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = grades_collection.insert_one(grade_data)
    grade_data['_id'] = result.inserted_id
    grade = serialize_doc(grade_data)
    
    return jsonify({
        'id': grade['id'],
        'student_id': grade['student_id'],
        'course_id': grade['course_id'],
        'grade': grade.get('grade'),
        'score': grade.get('score'),
        'feedback': grade.get('feedback')
    }), 201

@app.route('/api/grades/<grade_id>', methods=['PUT'])
def update_grade(grade_id):
    """Update grade"""
    grades_collection = get_collection('grades')
    grade_id_obj = to_object_id(grade_id)
    if not grade_id_obj:
        return jsonify({'error': 'Invalid grade ID'}), 400
    
    grade = grades_collection.find_one({'_id': grade_id_obj})
    if not grade:
        return jsonify({'error': 'Grade not found'}), 404
    
    data = request.json
    update_data = {'updated_at': datetime.utcnow()}
    
    if 'grade' in data:
        update_data['grade'] = data['grade']
    if 'score' in data:
        update_data['score'] = data['score']
    if 'feedback' in data:
        update_data['feedback'] = data.get('feedback', '')
    if 'certificate_issued' in data:
        update_data['certificate_issued'] = data['certificate_issued']
    
    grades_collection.update_one(
        {'_id': grade_id_obj},
        {'$set': update_data}
    )
    
    grade = grades_collection.find_one({'_id': grade_id_obj})
    grade = serialize_doc(grade)
    
    return jsonify({
        'id': grade['id'],
        'student_id': grade['student_id'],
        'course_id': grade['course_id'],
        'grade': grade.get('grade'),
        'score': grade.get('score'),
        'feedback': grade.get('feedback'),
        'certificate_issued': grade.get('certificate_issued', False)
    }), 200

@app.route('/api/grades/<grade_id>', methods=['DELETE'])
def delete_grade(grade_id):
    """Delete grade (set to null)"""
    grades_collection = get_collection('grades')
    grade_id_obj = to_object_id(grade_id)
    if not grade_id_obj:
        return jsonify({'error': 'Invalid grade ID'}), 400
    
    grade = grades_collection.find_one({'_id': grade_id_obj})
    if not grade:
        return jsonify({'error': 'Grade not found'}), 404
    
    grades_collection.update_one(
        {'_id': grade_id_obj},
        {'$set': {
            'grade': None,
            'score': None,
            'feedback': '',
            'updated_at': datetime.utcnow()
        }}
    )
    
    return jsonify({'message': 'Grade cleared successfully'}), 200

# ==================== Blockchain Routes ====================

@app.route('/api/blockchain/stats', methods=['GET'])
def get_blockchain_statistics():
    """Get blockchain statistics"""
    stats = get_blockchain_stats()
    return jsonify(stats), 200

@app.route('/api/blockchain/transactions', methods=['GET'])
def get_blockchain_transactions():
    """Get all blockchain transactions"""
    transactions_collection = get_collection('blockchain_transactions')
    transactions = list(transactions_collection.find())
    transactions = serialize_list(transactions)
    
    return jsonify([{
        'certificate_id': t.get('certificate_id'),
        'hash': t.get('hash'),
        'block_number': t.get('block_number'),
        'timestamp': t.get('timestamp'),
        'verified': t.get('verified', True)
    } for t in transactions]), 200

# ==================== Health Check ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    # Test database connection
    try:
        db = get_db()
        db.command('ping')
        db_status = 'connected'
    except Exception as e:
        db_status = f'error: {str(e)}'
    
    return jsonify({
        'status': 'healthy',
        'message': 'ChainLearn API is running',
        'database': db_status
    }), 200

# ==================== Registration Route ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """User registration endpoint"""
    data = request.json
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    role = data.get('role', 'student')  # Default to student
    
    # Validation
    if not email or not password or not name:
        return jsonify({'error': 'Email, password, and name are required'}), 400
    
    # Validate email format (basic)
    if '@' not in email:
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password length
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    # Validate role
    if role not in ['admin', 'teacher', 'student']:
        role = 'student'
    
    users_collection = get_collection('users')
    
    # Check if user already exists
    existing_user = users_collection.find_one({'email': email})
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 400
    
    # Hash password (in production, use bcrypt or similar)
    import hashlib
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    # Create new user
    user_data = {
        'email': email,
        'name': name,
        'role': role,
        'password_hash': password_hash,
        'created_at': datetime.utcnow()
    }
    
    result = users_collection.insert_one(user_data)
    user_data['_id'] = result.inserted_id
    user = serialize_doc(user_data)
    
    return jsonify({
        'success': True,
        'message': 'Registration successful',
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'role': user['role']
        }
    }), 201

# Cleanup on shutdown
@app.teardown_appcontext
def close_db_connection(error):
    """Close database connection on app teardown"""
    # MongoDB connection is persistent, no need to close on every request
    pass

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
