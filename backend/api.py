from flask import Flask, render_template, jsonify, request, redirect, session, g
from flask_restful import Api, Resource
from flask.helpers import url_for
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from distutils.log import error
from flask_cors import CORS
import json
import datetime

import re
import hashlib
import random

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
db = SQLAlchemy(app)
api = Api(app)
admin = Admin(app)
app.secret_key = 'TEAM106'
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

db.create_all()

admin.add_view(ModelView(UsersLogIn, db.session))
admin.add_view(ModelView(UserInfo, db.session))
admin.add_view(ModelView(Teams, db.session))
admin.add_view(ModelView(TicketTracker, db.session))
admin.add_view(ModelView(Comments, db.session))
admin.add_view(ModelView(Messages, db.session))


class TeamAPI(Resource):
    def get(self):
        teams = Teams.query.all()
        team_list = []
        for team in teams:
            team_list.append({'id':team.id,'name':team.team_name})
        return json.loads(json.dumps(team_list))

class TicketsAPI(Resource):
    def get(self):
        session = {'user_id':4}
        if 'user_id' in session: 
            user_info = UserInfo.query.filter_by(id=session['user_id']).first()
            if user_info.rank == 'manager':
                tickets = TicketTracker.query.filter_by(assigned_department_id=user_info.team_id).all()
                json_data = json.loads("{}")
                
                for i,ticket in enumerate(tickets):
                    user_info = UserInfo.query.filter_by(id=ticket.assigned_user_id).first()
                    json_data.update({i:{'ticket_id':ticket.id,
                                        'assignee': user_info.name,
                                        'due_date':str(ticket.due_date),
                                        'status':ticket.status}})
                return json_data
            elif user_info.rank == 'developer':
                tickets = TicketTracker.query.filter_by(assigned_user_id=session['user_id']).all()
                json_data = json.loads("{}")
                for i,ticket in enumerate(tickets):
                    user_info = UserInfo.query.filter_by(id=ticket.assigned_user_id).first()
                    json_data.update({i:{'ticket_id':ticket.id,
                                        'due_date':str(ticket.due_date),
                                        'status':ticket.status}})
                return json_data
    def post(self):
        session = {'user_id':1}
        if 'user_id' not in session:
            return
        action = json.loads(request.data)['action']
        print(action)
        if action == 'get_ticket_info':
            ticket_id = json.loads(request.data)['ticket_id']
            ticket_info = TicketTracker.query.filter_by(id=ticket_id).first()
            user_info = UserInfo.query.filter_by(id=ticket_info.assigned_user_id).first()
            team = Teams.query.filter_by(id=ticket_info.assigned_department_id).first()
            comments = Comments.query.filter_by(ticket_id=ticket_info.id).all()
            
            comment_data = []
            for cmnt in comments: #stores comment into a list
                comment_data.append({'id':cmnt.id,'comment':cmnt.comment})
            
            json_data = json.loads("{}")
            json_data.update({'ticket_info':{
                                            'ticket_id':ticket_info.id,
                                            'assined_to':user_info.name,
                                            'team':team.team_name,
                                            'due_date':str(ticket_info.due_date),
                                            'created_date':str(ticket_info.created_date),
                                            'status':ticket_info.status,
                                            'description':ticket_info.description
                                        },
                            'comments':json.loads(json.dumps(comment_data))
                            })
            return json_data
        
        elif action == 'post_comment':
            data = json.loads(request.data)
            ticket_id = data['ticket_id']
            comment = data['comment']
            new_comment = Comments(ticket_id=ticket_id, comment=comment)
            db.session.add(new_comment)
            db.session.commit()
            return 'success'
        elif action == 'create_ticket':
            print("endter")
            data = json.loads(request.data)
            user_id = data['assigned_user_id']
            due_date =datetime.datetime.strptime(data['due_date'], '%Y-%m-%d')
            
            status = data['status']
            description = data['description']
            created_date = datetime.datetime.now()
            user_info = UserInfo.query.filter_by(id=session['user_id']).first()
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
        
    def put(self):
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
        return 'failure'

def hashing(password):
    ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    chars = []
    for i in range(16):
        chars.append(random.choice(ALPHABET))
    
    salt = "".join(chars)
    current_pass = password+salt
    hashed = hashlib.md5(current_pass.encode())
    hashed = hashed.hexdigest()
    hashed_salted = "$"+salt+"$"+hashed
    

    # hashed_salted = password
    # pattern = re.compile(r'[$]\w+[$]')
    # matches = pattern.finditer(hashed_salted)
    # for match in matches:
    #     salt = match[0][1:-1]
    # concat_pass_salt = password+salt
    # result = hashlib.md5(concat_pass_salt.encode())
    # pattern2 = re.compile(r'[$]\w+')
    # matches2 = pattern2.finditer(hashed_salted)
    return hashed_salted

class CreateUser(Resource):
    def post(self):
        data = json.loads(request.data)
        username = data['username']
        password = hashing(data['password'])
        team_id = data['team_id']
        name = data['name']
        rank = data['rank'] #developer or manager
        new_user_login = UsersLogIn(username=username, password=password)
        db.session.add(new_user_login)
        db.session.commit()
        #inserting data
        new_user_info = UserInfo(name=name, rank=rank, team_id=int(team_id), user_id=new_user_login.id)
        db.session.add(new_user_info)
        db.session.commit()
        

class AuthenticateAPI(Resource):
    def post(self):
        session.pop('user_id', None)
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
                return  'success'
            else:
                return 'failure'

class MessagesAPI(Resource):
    #methods GET, POST, PUT, DELETE
    # def get(self): #doesn't accept body
    #     pass
    def post(self): #get msgs (current logged in user + from id), post msgs
        action = json.loads(request.data)['action']
        if action == 'get':
            return
        elif action == 'post': #inserting new msg
            data = json.loads(request.data)
            from_id = data['from_id']
            to = data['to_id']
            msg = data['msg']
            # {
            #     'from': user_id,
            #     'to': user_id,
            #     'msg':msg
            # }
    # def put(self):
    #     pass
    # def delete(self): #doesn't accept body
    #     pass
# alberto
# salt is
# @app.route('/',methods = ['GET' , 'POST'])
# def login_post():
#     if request.method == 'POST':
#         session.pop('user_id', None)
#         username = request.form['username']
#         password = request.form['password']
#         salt = 'uKgKdCMR2BtnneMv'
#         query_user = UsersLogIn.query.filter_by(username=username).first()
#         if query_user is not None:
#             hashed_salted = query_user.password
#             pattern = re.compile(r'[$]\w+[$]')
#             matches = pattern.finditer(hashed_salted)
#             for match in matches:
#                 salt = match[0][1:-1]
#             concat_pass_salt = password+salt
#             result = hashlib.md5(concat_pass_salt.encode())
#             pattern2 = re.compile(r'[$]\w+')
#             matches2 = pattern2.finditer(hashed_salted)
#             for matchs in matches2:
#                 right_part = matchs[0][1:]
#             if(result.hexdigest() == right_part):
#                 # update the redirect url to t.html?
#                 return redirect(url_for('teacher_logged'))
#             else:
#                 return redirect(url_for('login_post'))
    #return render_template('login.html')
                     
api.add_resource(TicketsAPI, '/tickets_api')
api.add_resource(AuthenticateAPI, '/authenticate')
api.add_resource(CreateUser, '/create_user')
api.add_resource(TeamAPI, '/team_info')
#api.add_resource(classnaeme, '/APIURL')

@app.route('/')
def home():
    return 'welcome'

if __name__ == '__main__':
    app.run(debug=True)