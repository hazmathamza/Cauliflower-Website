from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
import json
from datetime import datetime
import uuid

app = Flask(__name__)
app.config['SECRET_KEY'] = 'discord_clone_secret_key'
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory data storage (replace with a database in production)
USERS_FILE = 'data/users.json'
SERVERS_FILE = 'data/servers.json'
MESSAGES_FILE = 'data/messages.json'

# Create data directory if it doesn't exist
os.makedirs('data', exist_ok=True)

# Initialize data files if they don't exist
def initialize_data_files():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w') as f:
            json.dump([], f)
    
    if not os.path.exists(SERVERS_FILE):
        with open(SERVERS_FILE, 'w') as f:
            json.dump([], f)
    
    if not os.path.exists(MESSAGES_FILE):
        with open(MESSAGES_FILE, 'w') as f:
            json.dump({}, f)

initialize_data_files()

# Helper functions to read/write data
def read_data(file_path):
    with open(file_path, 'r') as f:
        return json.load(f)

def write_data(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

# User routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    users = read_data(USERS_FILE)
    
    # Check if email already exists
    if any(user['email'] == data['email'] for user in users):
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    new_user = {
        'id': f"user{uuid.uuid4().hex[:8]}",
        'username': data['username'],
        'email': data['email'],
        'password': data['password'],  # In production, hash this password
        'avatar': None,
        'status': 'Online',
        'customStatus': '',
        'role': 'member',
        'pronouns': '',
        'bannerUrl': None,
        'profileEffect': None,
        'aboutMe': '',
        'friends': [],
        'friendRequests': [],
        'createdAt': datetime.now().isoformat()
    }
    
    users.append(new_user)
    write_data(USERS_FILE, users)
    
    # Remove password from response
    user_response = {k: v for k, v in new_user.items() if k != 'password'}
    return jsonify(user_response), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    users = read_data(USERS_FILE)
    
    # Find user by email and password
    user = next((user for user in users if user['email'] == data['email'] and user['password'] == data['password']), None)
    
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Update user status to Online
    for u in users:
        if u['id'] == user['id']:
            u['status'] = 'Online'
    
    write_data(USERS_FILE, users)
    
    # Remove password from response
    user_response = {k: v for k, v in user.items() if k != 'password'}
    session['user_id'] = user['id']
    
    return jsonify(user_response), 200

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    users = read_data(USERS_FILE)
    
    # Update user status to Offline
    for user in users:
        if user['id'] == user_id:
            user['status'] = 'Offline'
    
    write_data(USERS_FILE, users)
    session.pop('user_id', None)
    
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/users', methods=['GET'])
def get_users():
    users = read_data(USERS_FILE)
    # Remove passwords from response
    users_response = [{k: v for k, v in user.items() if k != 'password'} for user in users]
    return jsonify(users_response), 200

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    users = read_data(USERS_FILE)
    user = next((user for user in users if user['id'] == user_id), None)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Remove password from response
    user_response = {k: v for k, v in user.items() if k != 'password'}
    return jsonify(user_response), 200

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    users = read_data(USERS_FILE)
    
    user_index = next((i for i, user in enumerate(users) if user['id'] == user_id), None)
    
    if user_index is None:
        return jsonify({'error': 'User not found'}), 404
    
    # Update user data
    for key, value in data.items():
        if key != 'id' and key != 'password':  # Don't allow changing id or password through this endpoint
            users[user_index][key] = value
    
    write_data(USERS_FILE, users)
    
    # Remove password from response
    user_response = {k: v for k, v in users[user_index].items() if k != 'password'}
    return jsonify(user_response), 200

# Server routes
@app.route('/api/servers', methods=['GET'])
def get_servers():
    servers = read_data(SERVERS_FILE)
    return jsonify(servers), 200

@app.route('/api/servers', methods=['POST'])
def create_server():
    data = request.json
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    servers = read_data(SERVERS_FILE)
    
    # Create new server
    new_server = {
        'id': f"server{uuid.uuid4().hex[:8]}",
        'name': data['name'],
        'icon': data.get('icon', '🌟'),
        'ownerId': user_id,
        'bannerUrl': data.get('bannerUrl', None),
        'roles': [
            {'id': 'role_owner', 'name': 'Owner', 'color': 'text-yellow-400', 'permissions': ['manageServer', 'manageChannels', 'manageRoles', 'kickMembers', 'banMembers', 'manageServerSettings']},
            {'id': 'role_default', 'name': 'Member', 'color': 'text-gray-300', 'permissions': []}
        ],
        'channels': [
            {'id': f"ch{uuid.uuid4().hex[:8]}", 'name': 'general', 'type': 'text', 'description': 'General discussion'}
        ],
        'members': [user_id],
        'createdAt': datetime.now().isoformat()
    }
    
    servers.append(new_server)
    write_data(SERVERS_FILE, servers)
    
    # Initialize messages for the general channel
    messages = read_data(MESSAGES_FILE)
    messages[new_server['channels'][0]['id']] = []
    write_data(MESSAGES_FILE, messages)
    
    return jsonify(new_server), 201

@app.route('/api/servers/<server_id>', methods=['GET'])
def get_server(server_id):
    servers = read_data(SERVERS_FILE)
    server = next((server for server in servers if server['id'] == server_id), None)
    
    if not server:
        return jsonify({'error': 'Server not found'}), 404
    
    return jsonify(server), 200

@app.route('/api/servers/<server_id>', methods=['PUT'])
def update_server(server_id):
    data = request.json
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    servers = read_data(SERVERS_FILE)
    server_index = next((i for i, server in enumerate(servers) if server['id'] == server_id), None)
    
    if server_index is None:
        return jsonify({'error': 'Server not found'}), 404
    
    # Check if user is the owner or has permission
    if servers[server_index]['ownerId'] != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    
    # Update server data
    for key, value in data.items():
        if key != 'id' and key != 'ownerId':  # Don't allow changing id or owner
            servers[server_index][key] = value
    
    write_data(SERVERS_FILE, servers)
    
    return jsonify(servers[server_index]), 200

@app.route('/api/servers/<server_id>/channels', methods=['POST'])
def create_channel(server_id):
    data = request.json
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    servers = read_data(SERVERS_FILE)
    server_index = next((i for i, server in enumerate(servers) if server['id'] == server_id), None)
    
    if server_index is None:
        return jsonify({'error': 'Server not found'}), 404
    
    # Check if user is the owner or has permission
    if servers[server_index]['ownerId'] != user_id:
        return jsonify({'error': 'Permission denied'}), 403
    
    # Create new channel
    new_channel = {
        'id': f"ch{uuid.uuid4().hex[:8]}",
        'name': data['name'].lower().replace(/\s+/g, '-'),
        'type': data.get('type', 'text'),
        'description': data.get('description', f"{data['name']} channel")
    }
    
    servers[server_index]['channels'].append(new_channel)
    write_data(SERVERS_FILE, servers)
    
    # Initialize messages for the new channel
    messages = read_data(MESSAGES_FILE)
    messages[new_channel['id']] = []
    write_data(MESSAGES_FILE, messages)
    
    return jsonify(new_channel), 201

# Message routes
@app.route('/api/messages/<channel_id>', methods=['GET'])
def get_messages(channel_id):
    messages = read_data(MESSAGES_FILE)
    channel_messages = messages.get(channel_id, [])
    return jsonify(channel_messages), 200

@app.route('/api/messages/<channel_id>', methods=['POST'])
def create_message(channel_id):
    data = request.json
    user_id = session.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    users = read_data(USERS_FILE)
    user = next((user for user in users if user['id'] == user_id), None)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    messages = read_data(MESSAGES_FILE)
    
    # Initialize channel messages if it doesn't exist
    if channel_id not in messages:
        messages[channel_id] = []
    
    # Create new message
    new_message = {
        'id': f"msg{uuid.uuid4().hex[:8]}",
        'content': data['content'],
        'userId': user_id,
        'userName': user['username'],
        'userAvatar': user['avatar'],
        'timestamp': datetime.now().timestamp() * 1000,  # Convert to milliseconds
        'file': data.get('file', None)
    }
    
    messages[channel_id].append(new_message)
    write_data(MESSAGES_FILE, messages)
    
    # Emit message to all users in the channel
    socketio.emit('new_message', {'channelId': channel_id, 'message': new_message}, room=channel_id)
    
    return jsonify(new_message), 201

# Friend request routes
@app.route('/api/friends/request', methods=['POST'])
def send_friend_request():
    data = request.json
    user_id = session.get('user_id')
    target_user_id = data.get('targetUserId')
    
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    if user_id == target_user_id:
        return jsonify({'error': 'Cannot send friend request to yourself'}), 400
    
    users = read_data(USERS_FILE)
    user_index = next((i for i, user in enumerate(users) if user['id'] == user_id), None)
    target_user_index = next((i for i, user in enumerate(users) if user['id'] == target_user_id), None)
    
    if user_index is None or target_user_index is None:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if already friends
    if target_user_id in users[user_index]['friends']:
        return jsonify({'error': 'Already friends'}), 400
    
    # Check if request already sent
    if any(req['fromUserId'] == user_id for req in users[target_user_index]['friendRequests']):
        return jsonify({'error': 'Friend request already sent'}), 400
    
    # Add friend request
    new_request = {
        'fromUserId': user_id,
        'status': 'pending',
        'timestamp': datetime.now().timestamp() * 1000  # Convert to milliseconds
    }
    
    users[target_user_index]['friendRequests'].append(new_request)
    write_data(USERS_FILE, users)
    
    # Emit friend request to target user
    socketio.emit('friend_request', {'fromUserId': user_id, 'toUserId': target_user_id}, room=target_user_id)
    
    return jsonify({'message': 'Friend request sent'}), 200

@app.route('/api/friends/request/<request_id>/respond', methods=['POST'])
def respond_to_friend_request(request_id):
    data = request.json
    user_id = session.get('user_id')
    action = data.get('action')  # 'accept' or 'decline'
    
    if not user_id:
        return jsonify({'error': 'Not logged in'}), 401
    
    if action not in ['accept', 'decline']:
        return jsonify({'error': 'Invalid action'}), 400
    
    users = read_data(USERS_FILE)
    user_index = next((i for i, user in enumerate(users) if user['id'] == user_id), None)
    
    if user_index is None:
        return jsonify({'error': 'User not found'}), 404
    
    # Find the friend request
    request_index = next((i for i, req in enumerate(users[user_index]['friendRequests']) if req['fromUserId'] == request_id), None)
    
    if request_index is None:
        return jsonify({'error': 'Friend request not found'}), 404
    
    # Get the requester
    requester_index = next((i for i, user in enumerate(users) if user['id'] == request_id), None)
    
    if requester_index is None:
        return jsonify({'error': 'Requester not found'}), 404
    
    # Remove the request
    users[user_index]['friendRequests'].pop(request_index)
    
    if action == 'accept':
        # Add each other as friends
        users[user_index]['friends'].append(request_id)
        users[requester_index]['friends'].append(user_id)
        
        # Create a DM channel
        sorted_user_ids = sorted([user_id, request_id])
        dm_channel_id = f"dm_{sorted_user_ids[0]}_{sorted_user_ids[1]}"
        
        # Initialize DM messages if it doesn't exist
        messages = read_data(MESSAGES_FILE)
        if dm_channel_id not in messages:
            messages[dm_channel_id] = []
            write_data(MESSAGES_FILE, messages)
        
        # Emit friend accepted to both users
        socketio.emit('friend_request_accepted', {
            'userId': user_id,
            'friendId': request_id,
            'dmChannelId': dm_channel_id
        }, room=user_id)
        socketio.emit('friend_request_accepted', {
            'userId': request_id,
            'friendId': user_id,
            'dmChannelId': dm_channel_id
        }, room=request_id)
    
    write_data(USERS_FILE, users)
    
    return jsonify({'message': f'Friend request {action}ed'}), 200

# Socket.IO events
@socketio.on('connect')
def handle_connect():
    user_id = session.get('user_id')
    if user_id:
        join_room(user_id)  # Join a room with the user's ID for direct messages

@socketio.on('join')
def handle_join(data):
    room = data['room']
    join_room(room)

@socketio.on('leave')
def handle_leave(data):
    room = data['room']
    leave_room(room)

@socketio.on('disconnect')
def handle_disconnect():
    user_id = session.get('user_id')
    if user_id:
        # Update user status to Offline
        users = read_data(USERS_FILE)
        for user in users:
            if user['id'] == user_id:
                user['status'] = 'Offline'
        write_data(USERS_FILE, users)
        
        # Emit user status change to all users
        socketio.emit('user_status_change', {'userId': user_id, 'status': 'Offline'})

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)