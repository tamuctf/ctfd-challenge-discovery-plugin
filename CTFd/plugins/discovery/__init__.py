import datetime
import hashlib
import json
from socket import inet_aton, inet_ntoa
from struct import unpack, pack, error as struct_error
from flask import current_app as app, render_template, request, redirect, jsonify, url_for, Blueprint, session, abort
from passlib.hash import bcrypt_sha256
from sqlalchemy.sql import not_
from CTFd.models import db, Teams, Solves, Awards, Challenges, WrongKeys, Keys, Tags, Files, Tracking, Pages, Config, Unlocks, DatabaseError, Hints, Unlocks
from CTFd.scoreboard import get_standings
from CTFd.plugins.challenges import get_chal_class

from sqlalchemy.sql import or_

from CTFd.utils import ctftime, view_after_ctf, authed, unix_time, get_kpm, user_can_view_challenges, is_admin, get_config, get_ip, is_verified, ctf_started, ctf_ended, ctf_name, admins_only
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
        chal = db.Column(db.Integer)
        discovery = db.Column(db.String(80))

        def __init__(self, chal, discovery):
            self.chal = chal
            self.discovery = discovery

        def __repr__(self):
            return "{0}".format(self.chal)



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
               json_data = {'service': [], 'auto': []}
               for x in service:
                   if x.discovery == "OFF" or x.discovery == "ON":
                       json_data['service'].append(x.discovery)
                   else:
                       json_data['auto'].append(x.discovery)
               return jsonify(json_data)
            discoveryList = DiscoveryList.query.filter_by(chal=chalid).all()
            json_data = {'discoveryList': []}
            for x in discoveryList:
                json_data['discoveryList'].append({'id': x.id, 'chal': x.chal, 'discovery': x.discovery})
            return jsonify(json_data)

        elif request.method == 'POST':
            if chalid == 0:
                services = DiscoveryList.query.filter_by(chal=0)

                previous = DiscoveryList.query.filter_by(chal=chalid)
                json_data = {'service': [], 'auto': []}
                for x in previous:
                    if x.discovery == "OFF" or x.discovery == "ON":
                        json_data['service'].append(x.discovery)
                    else:
                        json_data['auto'].append(x.discovery)

                for x in services:
                    db.session.delete(x)
                    db.session.commit()

                service = request.form.getlist('service[]')
                autoDiscovery = request.form.getlist('auto[]')

                for x in service:
                    discovery = DiscoveryList(chalid, x)
                    db.session.add(discovery)
                    for y in json_data['auto']:
                        discovery = DiscoveryList(chalid, y)
                        db.session.add(discovery)
                    
                for x in autoDiscovery:
                    discovery = DiscoveryList(chalid, x)
                    db.session.add(discovery)
                    for x in json_data['service']:
                        discovery = DiscoveryList(chalid, x)
                        db.session.add(discovery)

                db.session.commit()
                db.session.close()
                return '1'


            newdiscoveryList = request.form.getlist('discoveryList[]')
            discoveryList = DiscoveryList.query.filter_by(chal=chalid).all()

            for x in newdiscoveryList:
                skip=0
                for y in discoveryList:
                    if x == y.discovery:
                        skip = 1;
                if skip == 0:
                    discovery = DiscoveryList(chalid, x)
                    db.session.add(discovery)
            db.session.commit()
            db.session.close()
            return '1'
            

    @discoveryList.route('/admin/discoveryList/<string:auto>', methods=['GET', 'POST'])
    @admins_only
    def admin_AutoDiscovery(auto):
        if request.method == 'GET':
            json_data = {'Challenge': [], 'Dependent Challenges': [[]]}
            if auto == "basic": #Simple Auto Discovery
               #Challenges appear after the previous challenge in category was solved 
               chals = Challenges.query.filter(or_(Challenges.hidden != True, Challenges.hidden == None)).order_by(Challenges.value).all() #doesn't seem to be working
               #chals = Challenges.query.filter(or_(Challenges.hidden != True, Challenges.hidden == None)).order_by(Challenges.value).all()
               for x in chals:
                   json_data['Challenge'].append(x.id)
                   chals_cat = [chal for chal in chals if (chal != x and chal.value <= x.value and chal.category == x.category)]
                   if len(chals_cat) > 0:
                       chals_cat = chals_cat[-1].id

                   json_data['Dependent Challenges'].append(chals_cat)

            elif auto == "auto": #Broader Auto Discovery (Challenges become visible more easily)
               chals = Challenges.query.filter(or_(Challenges.hidden != True, Challenges.hidden == None)).order_by(Challenges.value).all()
               for x in chals:
                   starter = [chal for chal in chals if (chal != x and chal.value < x.value and chal.category == x.category)]
                   current_challenges = [[]]

                   if len(starter) > 0: # First Challenge in Category - Visible by default
                        
                       second_last_elem=[]
                       json_data['Challenge'].append(x.id)
                       chals_cat = [chal for chal in chals if (chal != x and chal.value <= x.value and chal.category == x.category)]
                       if len(chals_cat) > 0:
                           current_challenges.append(chals_cat[-1].id)
                           if len(chals_cat) > 1:
                               print(chals_cat[-2])
                               print(chals_cat[-2].id)
                               second_last_elem = chals_cat[-2].id

                       chals_not_cat = [chal for chal in chals if (chal != x and chal.value > x.value and chal.category != x.category)]
                       categories = []
                       for y in chals_not_cat:
                           if y.category not in categories:
                                categories.append(y.category)
                                current_cat = [chal for chal in chals_not_cat if (chal.value >= y.value and chal.category == y.category)]
                                for z in current_cat:
                                    print("Challenge:" + x.name + "2nd" + str(second_last_elem) + " : " + str(z.id))
                                    current_challenges.append((second_last_elem,z.id))


                   json_data['Dependent Challenges'].append(current_challenges)
            elif auto == "preview":
                hidden = DiscoveryList.query.filter_by(chal="preview")
                json_data = {'hidden': [], 'solved':[]}
                for x in hidden:
                    json_data['hidden'].append(x.discovery)
                solved = DiscoveryList.query.filter_by(chal="solved")
                for x in solved:
                    json_data['solved'].append(x.discovery)

                return jsonify(json_data)

            else:
                return "This method is not allowed"
    
            return jsonify(json_data)

        if request.method == 'POST':
            if auto == "delete":
                discovery = DiscoveryList.query.filter(id != 0).all()
                print discovery
                for x in discovery:
                    db.session.delete(x)
                db.session.commit()
                db.session.close()
                return '1'
            if auto == "preview":
                previous = DiscoveryList.query.filter_by(chal="preview")
                for x in previous:
                    db.session.delete(x)
                
                previous = DiscoveryList.query.filter_by(chal="solved")
                for x in previous:
                    db.session.delete(x)
            
                db.session.commit()

                solved = request.form.getlist('solved[]')
                for y in solved:
                    discovery = DiscoveryList('solved', y)
                    db.session.add(discovery)
                    db.session.commit()

                visible = []
                hidden = []
                if len(solved) > 0:
                    solved = solved[0].split("&")                
                    
                  
                    allDiscovery = DiscoveryList.query.filter(id != 0).all()
                    for x in allDiscovery:
                        if x.chal != 0:
                            #print('x.chal: ' + str(x.chal) + 'solved: ' + str(solved))
                            if str(x.chal) in solved:
                                visible.append(x.chal)
                            else:
                                discovery = filter(None, (' '.join(y.split("&")).split() for y in x.discovery))
                                discovery = [item for sublist in discovery for item in sublist]
                                #print discovery
                                current_visible=1
                                #print("Challenge: " + str(x.chal) +" Set:")
                                for y in discovery:
                                    if y[0] not in solved:
                                        current_visible=0
                                        break;
                                if(current_visible==1):
                                    visible.append(x.chal)
                                else:
                                    hidden.append(x.chal)

                else:
                    allDiscovery = DiscoveryList.query.filter(id != 0).all()
                    for x in allDiscovery:
                        if x.chal != 0:
                            discovery = filter(None, (' '.join(y.split("&")).split() for y in x.discovery))
                            discovery = [item for sublist in discovery for item in sublist]
                            if(len(discovery)>0):
                                hidden.append(x.chal)
                            else:
                                visible.append(x.chal)

                hidden = [x for x in hidden if x not in visible]
                #print('visible: '+str(visible))
                #print('hidden: '+str(hidden))
                
                json_data = {'visible': visible, 'hidden': hidden}
  
                for y in hidden:
                    discovery = DiscoveryList('preview', y)
                    db.session.add(discovery)         
 
                db.session.commit()
                db.session.close()
                return '1'
               
                


    @discoveryList.route('/admin/discoveryList/<int:discoveryid>/delete', methods=['POST', 'DELETE'])
    @admins_only
    def admin_delete_discoveryList(discoveryid):
        if request.method == 'POST' or request.method == 'DELETE':
            discovery = DiscoveryList.query.filter_by(id=discoveryid)
            for x in discovery:
                db.session.delete(x)
            db.session.commit()
            db.session.close()
            return '1'

    @challenges.route('/chals', methods=['GET'])
    def chals():
        if not utils.is_admin():
            if not utils.ctftime():
                if utils.view_after_ctf():
                    pass
                else:
                    abort(403)
        if utils.user_can_view_challenges() and (utils.ctf_started() or utils.is_admin()):
            chals = Challenges.query.filter(or_(Challenges.hidden != True, Challenges.hidden == None)).order_by(Challenges.value).all()

            # Only one line in chals() needed to add for Challenge Discovery
	    # -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=- 
	    chals = discovery(chals) if len(chals)!=0 else chals
	    # -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-   

            json = {'game': []}
            for x in chals:
                tags = [tag.tag for tag in Tags.query.add_columns('tag').filter_by(chal=x.id).all()]
                files = [str(f.location) for f in Files.query.filter_by(chal=x.id).all()]
                unlocked_hints = []
                if utils.authed():
                    unlocked_hints = set([u.itemid for u in Unlocks.query.filter_by(model='hints', teamid=session['id'])])
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
                if utils.authed():
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
    app.view_functions['admin.admin_delete_discoveryList'] = admin_delete_discoveryList
    app.view_functions['challenges.discovery'] = discovery
    
    app.register_blueprint(discoveryList)
