from flask import Flask, render_template, jsonify, request, redirect, session, g
from flask_restful import Api, Resource
from flask.helpers import url_for
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from distutils.log import debug, error
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import create_refresh_token
from flask_jwt_extended import get_jwt_identity
from flask_jwt_extended import jwt_required
from flask_jwt_extended import JWTManager
from datetime import timedelta
import json
import datetime
import re
import hashlib
import random

app = Flask(__name__)

#app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://team106:S-1408429@team106.mysql.pythonanywhere-services.com/team106$ticket_tracking_system'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
db = SQLAlchemy(app)
api = Api(app)
admin = Admin(app)
app.secret_key = 'TEAM106'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-string'
jwt = JWTManager(app)
CORS(app)
class UsersLogIn(db.Model):
    __tablename__ = 'users_login'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(80), unique=False, nullable=False)
    user_information = db.relationship("UserInfo", backref='users_login', uselist=False)

    def __repr__(self) -> str:
        return '<User %r>' % self.username

class UserInfo(db.Model):
    __tablename__ = 'user_info'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users_login.id'))
    rank = db.Column(db.String(80), unique=False, nullable=False)
    # team_id = db.Column(db.Integer, unique=False, nullable=False)
    #many to 1
    team_id = db.Column(db.Integer, db.ForeignKey('team_names.id'))
    team = db.relationship('Teams')
    ticket = db.relationship("TicketTracker", backref="ticket_tracker", lazy='dynamic')

    def __repr__(self) -> str:
        return '<User %r>' % self.name

class Teams(db.Model):
    __tablename__ = 'team_names'
    id = db.Column(db.Integer, primary_key=True)
    team_name = db.Column(db.String(80),unique=True, nullable=False)
    users = db.relationship("UserInfo", lazy='dynamic')
    tickets = db.relationship("TicketTracker", lazy='dynamic')
    def __repr__(self) -> str:
        return '<User %r>' % self.team_name

class TicketTracker(db.Model):
    __tablename__ = 'ticket_tracker'
    id = db.Column(db.Integer, primary_key=True)
    assigned_user_id = db.Column(db.Integer, db.ForeignKey('user_info.id'))
    due_date = db.Column(db.DateTime, nullable=False)
    created_date  = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(80), unique=False, nullable=False)
    description = db.Column(db.String(600), unique=False, nullable=False)
    assigned_department_id = db.Column(db.Integer, db.ForeignKey('team_names.id'))
    team = db.relationship('Teams')
    comments = db.relationship('Comments', backref='ticket_tracker',lazy='dynamic')

class Comments(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey('ticket_tracker.id'))
    comment = db.Column(db.String(600), unique=False, nullable=True)

class Messages(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)
    from_user = db.Column(db.String(80), unique=False, nullable=False)
    to_user = db.Column(db.String(80), unique=False, nullable=False)
    msg = db.Column(db.String(500), unique=False, nullable=False)
class SecureModelView(ModelView):
    def is_accessible(self):
        try:
            return session['user_id'] == UsersLogIn.query.filter_by(id=9).first().id
        except:
            return False

admin.add_view(ModelView(UsersLogIn, db.session))
admin.add_view(ModelView(UserInfo, db.session))
admin.add_view(ModelView(Teams, db.session))
admin.add_view(ModelView(TicketTracker, db.session))
admin.add_view(ModelView(Comments, db.session))
admin.add_view(ModelView(Messages, db.session))
db.create_all()



class TeamAPI(Resource):
    def get(self):
        #needs to be open because when creating a new user
        teams = Teams.query.all()
        team_list = []
        for team in teams:
            team_list.append({'id':team.id,'name':team.team_name})
        return team_list

class TicketsAPI(Resource):
    @jwt_required()
    def get(self):
        user_name = get_jwt_identity()
        user_cred = UsersLogIn.query.filter_by(username=user_name).first()
        user_info = UserInfo.query.filter_by(user_id=user_cred.id).first()
        if user_info.rank == 'manager':
            tickets = TicketTracker.query.filter_by(assigned_department_id=user_info.team_id).all()

            output = []
            for i,ticket in enumerate(tickets):
                user_info = UserInfo.query.filter_by(id=ticket.assigned_user_id).first()
                output.append({'ticket_id':ticket.id,
                                    'assined_to': user_info.name,
                                    'due_date':str(ticket.due_date),
                                    'created_date':str(ticket.created_date),
                                    'status':ticket.status,
                                    'summary':ticket.description})

            return output
        elif user_info.rank == 'developer':
            tickets = TicketTracker.query.filter_by(assigned_user_id=user_info.id).all()

            output = []
            for i,ticket in enumerate(tickets):
                user_info = UserInfo.query.filter_by(id=ticket.assigned_user_id).first()
                output.append({'ticket_id':ticket.id,
                                    'due_date':str(ticket.due_date),
                                    'created_date':str(ticket.created_date),
                                    'status':ticket.status,
                                    'summary':ticket.description})
            return output
    @jwt_required()
    def post(self):
        # if 'user_id' not in session:
        #     return
        action = json.loads(request.data)['action']

        if action == 'get_ticket_info':
            ticket_id = json.loads(request.data)['ticket_id']
            ticket_info = TicketTracker.query.filter_by(id=ticket_id).first()
            user_info = UserInfo.query.filter_by(id=ticket_info.assigned_user_id).first()
            team = Teams.query.filter_by(id=ticket_info.assigned_department_id).first()

            ticket_info_out = []
            ticket_info_out.append({
                                            'ticket_id':ticket_info.id,
                                            'assined_to':user_info.name,
                                            'team':team.team_name,
                                            'due_date':str(ticket_info.due_date),
                                            'created_date':str(ticket_info.created_date),
                                            'status':ticket_info.status,
                                            'description':ticket_info.description
                                        })
            return ticket_info_out

        elif action == 'get_comments_given_ticket':
            ticket_id = json.loads(request.data)['ticket_id']
            ticket_info = TicketTracker.query.filter_by(id=ticket_id).first()
            comments = Comments.query.filter_by(ticket_id=ticket_info.id).all()
            comment_data = []
            for cmnt in comments: #stores comment into a list
                comment_data.append({'id':cmnt.id,'comment':cmnt.comment})
            return comment_data
        elif action == 'post_comment':
            data = json.loads(request.data)
            ticket_id = data['ticket_id']
            comment = data['comment']
            new_comment = Comments(ticket_id=ticket_id, comment=comment)
            db.session.add(new_comment)
            db.session.commit()
            return 'success'
        elif action == 'create_ticket':
            data = json.loads(request.data)
            try:
                assigned_to_id = json.loads(request.data)['assigned_to_id']
                user_cred = UserInfo.query.filter_by(id=assigned_to_id).first()
                if user_cred is not None:
                    user_info = UserInfo.query.filter_by(user_id=user_cred.id).first()

                    user_id = user_info.id
                    due_date =datetime.datetime.strptime(data['due_date'], '%Y-%m-%d')

                    status = data['status']
                    description = data['description']
                    created_date = datetime.datetime.now()
                    user_info = UserInfo.query.filter_by(user_id=session['user_id']).first()
                    team_id = user_info.team_id
                    new_ticket = TicketTracker(assigned_user_id=user_id,
                                                due_date=due_date,
                                                created_date=created_date,
                                                status=status,
                                                description=description,
                                                assigned_department_id=team_id)
                    db.session.add(new_ticket)
                    db.session.commit()
                    return 'success'
                else:
                    due_date =datetime.datetime.strptime(data['due_date'], '%Y-%m-%d')

                    status = data['status']
                    description = data['description']
                    created_date = datetime.datetime.now()

                    team_id = int(data['team_id'])
                    new_ticket = TicketTracker(
                                                due_date=due_date,
                                                created_date=created_date,
                                                status=status,
                                                description=description,
                                                assigned_department_id=team_id)
                    db.session.add(new_ticket)
                    db.session.commit()
                    return 'success'
            except:
                due_date =datetime.datetime.strptime(data['due_date'], '%Y-%m-%d')

                status = data['status']
                description = data['description']
                created_date = datetime.datetime.now()

                team_id = int(data['team_id'])
                new_ticket = TicketTracker(
                                            due_date=due_date,
                                            created_date=created_date,
                                            status=status,
                                            description=description,
                                            assigned_department_id=team_id)
                db.session.add(new_ticket)
                db.session.commit()
                return 'success'


    @jwt_required()
    def put(self):
        # if 'user_id' not in session:
        #     return
        action = json.loads(request.data)['action']
        if action == 'edit_comment':
            data = json.loads(request.data)
            comment_id = data['comment_id']
            new_comment = data['comment']
            comment = Comments.query.filter_by(id=comment_id).first()
            comment.comment = new_comment
            db.session.commit()
            return 'success'
        elif action == 'edit_status':
            data = json.loads(request.data)
            new_status = data['status']
            ticket_info = TicketTracker.query.filter_by(id=data['ticket_id']).first()
            ticket_info.status = new_status
            db.session.commit()
            return 'success'
        elif action == 'edit_ticket_assigned_to':
            current_user = get_jwt_identity()
            if current_user != 'manager':
                return f'NOT A MANGER {current_user}'
            data = json.loads(request.data)
            new_user_id = data['assigned_to_id']
            ticket_info = TicketTracker.query.filter_by(id=data['ticket_id']).first()
            ticket_info.assigned_user_id = int(new_user_id)
            db.session.commit()
            return 'success'
        return 'failure'


def hashing(password):
    ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    chars = []
    for i in range(16):
        chars.append(random.choice(ALPHABET))

    salt = "".join(chars)
    current_pass = str(password)+salt
    hashed = hashlib.md5(current_pass.encode())
    hashed = hashed.hexdigest()
    hashed_salted = "$"+salt+"$"+hashed
    return hashed_salted

class CreateUser(Resource):
    def post(self):
        try:
            data = json.loads(request.data)
            username = data['username']
            password = hashing(data['password'])
            team_id = data['team_id']
            name = data['name']
            rank = 'developer' #developer or manager
            new_user_login = UsersLogIn(username=username, password=password)
            db.session.add(new_user_login)
            db.session.commit()
            #inserting data
            new_user_info = UserInfo(name=name, rank=rank, team_id=int(team_id), user_id=new_user_login.id)
            db.session.add(new_user_info)
            db.session.commit()
            return "2000 ok"
        except:
            return {'message': 'Something went wrong'}, 500


class LoginAPI(Resource):
    def post(self):
        #session.pop('user_id', None)
        # try:
        data = json.loads(request.data)
        username = data['username']
        password = data['password']
        query_user = UsersLogIn.query.filter_by(username=username).first()

        if query_user is not None:
            hashed_salted = query_user.password
            pattern = re.compile(r'[$]\w+[$]')
            matches = pattern.finditer(hashed_salted)
            for match in matches:
                salt = match[0][1:-1]
            concat_pass_salt = password+salt
            result = hashlib.md5(concat_pass_salt.encode())
            pattern2 = re.compile(r'[$]\w+')
            matches2 = pattern2.finditer(hashed_salted)
            for matchs in matches2:
                right_part = matchs[0][1:]
            if(result.hexdigest() == right_part):
                # update the redirect url to t.html?

                #app.permanent_session_lifetime = timedelta(minutes=480)
                user_info = UserInfo.query.filter_by(user_id=query_user.id).first()
                access_token = create_access_token(identity = data['username'])
                team = Teams.query.filter_by(id=user_info.team_id).first()
                if team is None:
                    team = 'admin'
                else:
                    team = team.team_name

                return {
                    'rank': user_info.rank,
                    'team':team,
                    'access_token': access_token,
                    'username':username,
                    'name':user_info.name
                    }
                #return  user_info.rank
            else:
                return 'failure'
        return 'failure'
        # except:
        #     return 'failure'

    def delete(self):
        #session.pop('user_id', None)
        return 'success'

class MessagesAPI(Resource):
    @jwt_required()
    def get(self):
        users = UserInfo.query.all()
        output = []
        for user in users:
            output.append(user.name)
        return output
    @jwt_required()
    def post(self): #get msgs (current logged in user + from id), post msgs
        # if 'user_id' not in session:
        #     return

        action = json.loads(request.data)['action']
        if action == 'get':

            from_user_name = json.loads(request.data)['from_user_name']
            to_user_name = json.loads(request.data)['to_user_name']

            user_cred_from = UsersLogIn.query.filter_by(username=from_user_name).first()
            user_cred_to = UsersLogIn.query.filter_by(username=to_user_name).first()

            user_info_from = UserInfo.query.filter_by(user_id=user_cred_from.id).first()
            user_info_to = UserInfo.query.filter_by(user_id=user_cred_to.id).first()

            from_user = UserInfo.query.filter_by(id=user_info_from.id).first()
            to_user=  UserInfo.query.filter_by(id=user_info_to.id).first()

            all_messages = Messages.query.filter_by(from_user=user_info_from.id, to_user=to_user.id)

            output = []
            # this is formatting the data to be sent out\

            for msg in all_messages:
                output.append({"from": from_user.name,
                                        "to": to_user.name,
                                        "message": msg.msg })
            return output

        elif action == 'post': #inserting new msg
            data = json.loads(request.data)
            from_user_name = json.loads(request.data)['from_user_name']
            to_user_name = json.loads(request.data)['to_user_name']
            msg = data['msg']

            user_cred_from = UsersLogIn.query.filter_by(username=from_user_name).first()
            user_cred_to = UsersLogIn.query.filter_by(username=to_user_name).first()

            user_info_from = UserInfo.query.filter_by(user_id=user_cred_from.id).first()
            user_info_to = UserInfo.query.filter_by(user_id=user_cred_to.id).first()

            from_user = UserInfo.query.filter_by(id=user_info_from.id).first()
            to_user_id =  UserInfo.query.filter_by(id=user_info_to.id).first()

            message_entry = Messages(from_user = from_user.id, to_user = to_user_id.id,msg = msg)
            db.session.add(message_entry)
            db.session.commit()
            return 'success on sending the msg'

class userAPI(Resource):
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        if current_user != 'manager':
            return f'NOT A MANAGER! {current_user}'
        data = json.loads(request.data)
        team_id = data['team_id']

        try:
            user_info = UserInfo.query.filter_by(team_id=int(team_id)).all()
            output = []
            for user in user_info:
                # tickets = TicketTracker.query.filter_by(assigned_user_id=user.id).first()
                # if tickets is None:
                if user.rank is not 'manager':
                    output.append({"id":user.id, "name":user.name})
            return output

        except:
            return "{}"




api.add_resource(TicketsAPI, '/tickets_api')
api.add_resource(LoginAPI, '/login')
api.add_resource(CreateUser, '/create_user')
api.add_resource(TeamAPI, '/team_info')
api.add_resource(MessagesAPI, '/messages')
api.add_resource(userAPI, '/users')




@app.route('/', methods=['GET', 'POST'])
def home():
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)