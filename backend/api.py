from flask import Flask, render_template, jsonify, request, redirect, session, g
from flask_restful import Api, Resource
from flask.helpers import url_for
from flask_sqlalchemy import SQLAlchemy
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from distutils.log import error
from flask_cors import CORS
import json

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


class TicketsAPI(Resource):
    def get(self):
        session = {'user_id':1}
        if 'user_id' in session: 
            user_info = UserInfo.query.filter_by(id=session['user_id']).first()
            if user_info.rank == 'manager':
                tickets = TicketTracker.query.filter_by(assigned_user_id=session['user_id']).all()
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

api.add_resource(TicketsAPI, '/tickets_api')
@app.route('/')
def home():
    return 'welcome'

if __name__ == '__main__':
    app.run(debug=True)