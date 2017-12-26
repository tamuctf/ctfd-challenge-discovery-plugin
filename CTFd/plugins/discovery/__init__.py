import datetime
import hashlib
import json
from socket import inet_aton, inet_ntoa
from struct import unpack, pack, error as struct_error
from flask import current_app as app, render_template, request, redirect, jsonify, url_for, Blueprint, session
from passlib.hash import bcrypt_sha256
from sqlalchemy.sql import not_
from CTFd.models import db, Teams, Solves, Awards, Challenges, WrongKeys, Keys, Tags, Files, Tracking, Pages, Config, Unlocks, DatabaseError, Hints, Unlocks
from CTFd.scoreboard import get_standings
from CTFd.plugins.challenges import get_chal_class

from sqlalchemy.sql import or_

from CTFd.utils import ctftime, view_after_ctf, authed, unix_time, get_kpm, user_can_view_challenges, is_admin, get_config, get_ip, is_verified, ctf_started, ctf_ended, ctf_name, admins_only
# from CTFd.models import Hint
from CTFd.admin import admin
from CTFd.challenges import challenges

from flask_sqlalchemy import SQLAlchemy
from passlib.hash import bcrypt_sha256
from sqlalchemy.exc import DatabaseError
from sqlalchemy import String
from CTFd.plugins import register_plugin_asset
from CTFd import utils

class DiscoveryList(db.Model):
        id = db.Column(db.Integer, primary_key=True)
        chal = db.Column(db.Integer, db.ForeignKey('challenges.id'))
        discovery = db.Column(db.String(80))
        service = db.String(80)

        def __init__(self, chal, discovery):
            self.chal = chal
            self.discovery = discovery

        def __repr__(self):
            return "{0}".format(self.chal)

        def get_service(self, service):
            return service


def load(app):
    app.db.create_all()

    discoveryList = Blueprint('discoveryList', __name__)

    register_plugin_asset(app, asset_path='/plugins/discovery/config.js')
            
    @discoveryList.route('/admin/discoveryList/<int:chalid>', methods=['GET', 'POST'])
    @admins_only
    def admin_discoveryList(chalid):
        if request.method == 'GET':
            if chalid == 0:
               service = DiscoveryList.query.filter_by(chal=chalid)
               json_data = {'service': []}
               for x in service:
                   json_data['service'].append(x.discovery)
               return jsonify(json_data)
            discoveryList = DiscoveryList.query.filter_by(chal=chalid).all()
            json_data = {'discoveryList': []}
            for x in discoveryList:
                json_data['discoveryList'].append({'id': x.id, 'chal': x.chal, 'discovery': x.discovery})
            return jsonify(json_data)

        elif request.method == 'POST':
            if chalid == 0:
                services = DiscoveryList.query.filter_by(chal=0)
                for x in services:
                    db.session.delete(x)
                db.session.commit()

            newdiscoveryList = request.form.getlist('discoveryList[]')
            for x in newdiscoveryList:
                discovery = DiscoveryList(chalid, x)
                db.session.add(discovery)
            db.session.commit()
            db.session.close()
            return '1'
            

    @discoveryList.route('/admin/discoveryList/<int:discoveryid>/delete', methods=['POST', 'DELETE'])
    @admins_only
    def admin_delete_discoveryList(discoveryid):
        if request.method == 'POST' or request.method == 'DELETE':
            discovery = DiscoveryList.query.filter_by(id=discoveryid).first_or_404()
            db.session.delete(discovery)
            db.session.commit()
            db.session.close()
            return '1'
            openchal
    #@admin.route('/admin/chal/delete', methods=['POST'])
    #@admins_only
    #def admin_delete_chal():
     #   challenge = Challenges.query.filter_by(id=request.form['id']).first_or_404()
      #  WrongKeys.query.filter_by(chalid=challenge.id).delete()
       # Solves.query.filter_by(chalid=challenge.id).delete()
        #Keys.query.filter_by(chal=challenge.id).delete()
        #files = Files.query.filter_by(chal=challenge.id).all()
        #for f in files:
        #    utils.delete_file(f.id)
        #Files.query.filter_by(chal=challenge.id).delete()
        #Tags.query.filter_by(chal=challenge.id).delete()
        #DiscoveryList.query.filter_by(chal=challenge.id).delete()
        #Challenges.query.filter_by(id=challenge.id).delete()
        #db.session.commit()
        #db.session.close()
        #return '1'

    @challenges.route('/chals', methods=['GET'])
    def chals():
        if not utils.is_admin():
            if not utils.ctftime():
                if utils.view_after_ctf():
                    pass
                else:
                    abort(403)
        if utils.user_can_view_challenges() and (utils.ctf_started() or utils.is_admin()):
            teamid = session.get('id')
            chals = Challenges.query.filter(or_(Challenges.hidden != True, Challenges.hidden == None)).order_by(Challenges.value).all()

            # Only one line in chals() needed to add for Challenge Discovery
	    # -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- 
	    chals = discovery(chals) if len(chals)!=0 else chals
	    # -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-   

            json = {'game': []}
            for x in chals:
                tags = [tag.tag for tag in Tags.query.add_columns('tag').filter_by(chal=x.id).all()]
                files = [str(f.location) for f in Files.query.filter_by(chal=x.id).all()]
                unlocked_hints = set([u.itemid for u in Unlocks.query.filter_by(model='hints', teamid=teamid)])
                hints = []
                for hint in Hints.query.filter_by(chal=x.id).all():
                    if hint.id in unlocked_hints or utils.ctf_ended():
                        hints.append({'id': hint.id, 'cost': hint.cost, 'hint': hint.hint})
                    else:
                        hints.append({'id': hint.id, 'cost': hint.cost})
                chal_type = get_chal_class(x.type)
                json['game'].append({
                    'id': x.id,
                    'type': chal_type.name,
                    'name': x.name,
                    'value': x.value,
                    'description': x.description,
                    'category': x.category,
                    'files': files,
                    'tags': tags,
                    'hints': hints,
                    'template': chal_type.templates['modal'],
                    'script': chal_type.scripts['modal'],
                })

            db.session.close()
            return jsonify(json)
        else:
            db.session.close()
            abort(403)
            
            
    def discovery(chals):
        #print("Testing")
        #print(chals)
        #if is_admin():
        #    print("In Admin")
        #    return chals
        for x in DiscoveryList.query.filter_by(chal=0):
          if (x.discovery == "OFF"):
              return chals

        discovered = []
        for x in chals:
          show, and_list = 0, []
          #print("Challenge #" + str(x.id) + " - Needed problems solved to be seen:")
          for y in DiscoveryList.query.add_columns('id', 'discovery', 'chal').all(): # For each OR set
            if (str(y.chal) == str(x.id) and show != 1):
              and_list = map(int, (y.discovery).split('&'))
              #print("NEEDED: " + str(and_list))
              for need_solved in and_list: # For each AND elem
                show = 2
                for z in Solves.query.add_columns('chalid').filter_by(teamid=session['id']).all():
                  if need_solved == z.chalid:
                    show = 1 # Chal is solved and is needed
                    #print("Challenge ID: " + str(need_solved) + " has been solved & is needed")
                    break
                if (show == 2): #Challenge is not solved and is needed
                  and_list=[] # Mark wrong
                  break
          if ((len(and_list)==0 and show == 0) or show==1):
            #print("Shown, because of:" + str(and_list) + " show:" + str(show) +'\n')
            discovered.append(x)
          #else:
           # print("HIDDEN, solved:" + str(and_list) + " show:" + str(show) +'\n')

        print(chals)
        return discovered 
    
    app.view_functions['challenges.chals'] = chals
    #app.view_functions['admin.admin_delete_chal'] = admin_delete_chal
    app.view_functions['admin.admin_delete_discoveryList'] = admin_delete_discoveryList
    app.view_functions['challenges.discovery'] = discovery
    
    app.register_blueprint(discoveryList)
