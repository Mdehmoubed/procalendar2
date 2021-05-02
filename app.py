from flask import Flask, render_template, request, session ,url_for,redirect,flash ,logging ,jsonify,json
from flask_mail import Mail, Message
from flask_apscheduler import APScheduler
from threading import Thread
import sqlite3 as sql
from functools import wraps
from datetime import date,time,datetime,timedelta
import calendar_9 # this use for heroku
import random
import time
from backports.datetime_fromisoformat import MonkeyPatch # this use for heroku
MonkeyPatch.patch_fromisoformat() # this use for heroku


#from passlib.hash import sha256_crypt

app = Flask(__name__)


DATABASE ='/mdn1.db'
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

###this part for scheduler

scheduler = APScheduler()# scheduler object for reminder email
scheduler.init_app(app) # init it whit app
scheduler.start() # start to work


##### this part for email sender 
app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'procalendar.mehrdad@gmail.com'
app.config['MAIL_PASSWORD'] = 'Ashtad@1363'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)


def async_send_mail(app, msg):
    with app.app_context():
        mail.send(msg)



def send_email(email_address,message_body,subjects):
    msg = Message(subjects, sender = 'procalendar.mehrdad@gmail.com', recipients = [email_address])
    msg.body = message_body
    thr = Thread(target=async_send_mail, args=[app, msg])
    thr.start()
    return thr



@app.route('/')
def home():
    return render_template('home1.html')

def is_logged_in(f):
    @wraps(f)
    def wrap(*args, **kwargs):
        if 'logged_in' in session:
            return f(*args, **kwargs)
        else:
            flash( 'Please login')
            return redirect('/')
    return wrap



@app.route('/aduser', methods=['POST','GET'])
def adduser():
    if request.method =='POST':
        uname=request.form['uname']
        psw=request.form['psw']
        iemail=request.form['iemail']
        lname=request.form['lname']
        fname=request.form['fname']
        firstDay=6;timeInterval=60;viewLy='Month'   #default ViewSet
        con=sql.connect("mdn1.db")
        cur=con.cursor()
        cur.execute('INSERT INTO users(username,password,email,lname,fname,firstDay,timeInterval,viewLy) VALUES (?,?,?,?,?,?,?,?)', (uname,psw,iemail,lname,fname,firstDay,timeInterval,viewLy))
        con.commit()
        cur.execute('INSERT INTO groups(name,username,color,showG) VALUES (?,?,?,?) ',(uname,uname,'#8080ff',True))            
        con.commit()
        subjects='Welcome to Pro-Calendar '
        message_body=f"Hello {fname},\n You are a Proclander   "
        email_address=iemail
        send_email(iemail,message_body,subjects)
        session['logged_in'] = True
        session['username'] = uname 
        return redirect('/dashboard')
    else:
        return     

#checkuser
@app.route('/usercheck',methods = ['POST','GET']) 
def checkuser():
    con=sql.connect("mdn1.db")
    cur=con.cursor()
    checkReq=json.loads(request.form['checkReq'])
    print(checkReq)
    if checkReq['flag'] == 'uname':
        cur.row_factory= dict_factory
        cur.execute('SELECT * FROM users WHERE username=?',(checkReq['uname'],))
        a=cur.fetchall()
        con.close()
        return {'pass':(len(a)==0 )}
    if checkReq['flag'] == 'iemail':
        cur.row_factory= dict_factory
        cur.execute('SELECT * FROM users WHERE email=?',(checkReq['iemail'],))
        a=cur.fetchall()
        #print(checkReq['iemail'])
        #print(a)
        con.close()
        return {'pass':(len(a)==0 )}
    if checkReq['flag'] == 'validemail':
       global rndNum
       rndNum=random.randint(100000,999999) 
       #print(rndNum)
       email=checkReq['email']
       uname=checkReq['username']
       subjects='PRO-Calendar email validation'
       message_body= 'Hello '+uname+', \n Please Enter this validation code to active your account\t'\
       + str(rndNum)+ '\n \n Pro-calendar team'
       send_email(email,message_body,subjects)
       global requestTime 
       requestTime = datetime.now()
       #print(requestTime) 
       requestTime += timedelta(minutes=5)#5 minutes life time
       #print(requestTime)
       return  'ok'  
    if checkReq['flag'] == 'rndcode':
        code= int(checkReq['code'])
        allPass = datetime.now() < requestTime and code == rndNum
        if  not (allPass):
            flash('Your registration faild!!!')
        return {'pass': allPass }
  
    #logIn#############################################
    if checkReq['flag']=='login':   
        cur.row_factory= dict_factory
        cur.execute('SELECT * FROM users WHERE username=?',(checkReq['uname'],))
        a=cur.fetchall()
        con.close()
        if len(a)==0:            
            return {'pass':'There is not Username'}
        elif a[0]['password'] != checkReq['pass']:
            return {'pass':'The password is wrong'}
        else:
            session['logged_in'] = True
            session['username'] = checkReq['uname'] 
            #print(session['username'])  
            return{'pass':''}
    #del Account########################################    
    if checkReq['flag']=='delUser':
        a=session['username']
        cur.execute('DELETE FROM users WHERE username = ?;',(a,))
        con.commit()
        con.close()      
        return 'ok'


@app.route('/default_calendar',methods = ['POST','GET'])
def defualt_calendar():
   
#   if method != 'POST" return redirect 
    data_rec=json.loads(request.form['data'])   
    month = data_rec['month']
    year = data_rec['year']
    dayToV =data_rec['dayToV']    
    week_header,week_abbr,month_name,month_abbr,c = calendName(6)
    month_header=month_name[month]+" "+str(year)

#make day_header {0:{name:28,cur:c}}  p/c/n are the posible value for cur
# maybe we want to show them in another style
    next_month=((month)%12)+1
    pre_month=((month-2)%12)+1 
    day_header=[]
    for i in c.itermonthdays3(year,month):
        k={}
        if i[1]==month:
            k['cur']='c'
        elif  i[1]==next_month:
            k['cur']='n'
        else:
            k['cur']='p'  
        k['name']= month_name[i[1]]+" 1" if i[2]==1 else i[2]
        k['id'] = date(i[0],i[1],i[2]).strftime('%Y-%m-%d')
        day_header.append(k)   
    data={'month_header':month_header,'day_header':day_header}

    return {'data':data}



#edit user
@app.route('/edit_user' ,methods=['POST','GET'])
@is_logged_in
def edit_user():
    if request.method =='POST':
        psw=request.form['psw']
        lname=request.form['lname']
        fname=request.form['fname']
        con=sql.connect("mdn1.db")
        cur=con.cursor()        
        cur.execute('UPDATE users SET password=?,lname=?,fname=? WHERE username=?',(psw,lname,fname,session['username']))        
        con.commit()
        flash('Your Account updated')
        return redirect('/dashboard')
    else:
        return     
    
    



##dashboard
@app.route('/dashboard')
@is_logged_in
def dashboard():
    time.sleep(1)
    con=sql.connect("mdn1.db")
    con.row_factory =dict_factory
    cur=con.cursor()
    #cur.execute("select username , email, lname, fname, firstDay,timeInterval,viewLy from users where username = ?",(session['username'],))
    cur.execute("select * from users where username = ?",(session['username'],))
    global user 
    global groups
    user=cur.fetchall()[0]
    #user['ViewSet']=json.loads(user['ViewSet'])
    cur.execute("select * from groups where username = ?",(session['username'],))
    groups=cur.fetchall()
    con.close()
    #return render_template('indexi.html',user=user)
    if user['viewLy']=='   Week':       
        return render_template('weekly.html',user=user,groups=groups)
    if user['viewLy']=='   Month':
        return render_template('monthly.html',user=user,groups=groups)
    if user['viewLy']=='   Day':
        return render_template('daily.html',user=user,groups=groups)  
    if user['viewLy']=='  Year':
        return render_template('yearly.html',user=user,groups=groups)      
    return render_template('monthly.html',user=user,groups=groups)

@app.route('/year_calendar',methods = ['POST','GET'])
@is_logged_in
def year_calendar():
    month,year,dayToV,viewLy,timeInterval,firstDay=data_requst()
    week_header,week_abbr,month_name,month_abbr,c = calendName(firstDay)
    print(week_abbr)
    global user
    #month_name, for month headers 
    #week_abbr, for week days
    a=c.yeardayscalendar(year,12)[0] 
    m_index=1
    cell_id=[]
    for mon in a:
        mon_id=[]
        for week in mon:
            week_id=[]
            for day in week:
                id=str(year)+'-'+str(m_index).zfill(2)+'-'+str(day).zfill(2)
                if day==0 :
                    id=''
                week_id.append(id)
            mon_id.append(week_id)
        cell_id.append(mon_id)
        m_index +=1
    a=str(year)+'-01-01'
    b=str(year+1)+'-01-01'
    con=sql.connect("mdn1.db")
    con.row_factory =dict_factory
    cur=con.cursor()
    cur.execute("select event.eventname ,groups.color, event.start,event.eventID,event.endt,event.date \
        from event natural join groups where groups.showG=1 and event.date <? and \
        event.date >=? and  event.username=? order by event.date ,event.start",(b,a,session['username']))
    day_event=cur.fetchall()
    con.close() 
    data={'month_name':month_name,'week_header':week_abbr,'user':user,\
    'cell_id':cell_id,'day_event':day_event,'groups':groups}
    return {'data':data}



## month calendar MVC 
@app.route('/month_calendar',methods = ['POST','GET'])
@is_logged_in
def month_calendar():
    month,year,dayToV,viewLy,timeInterval,firstDay=data_requst()
    week_header,week_abbr,month_name,month_abbr,c = calendName(firstDay)
    global user
    month_header=month_name[month]+" "+str(year)

#make day_header {0:{name:28,cur:c}}  p/c/n are the posible value for cur
# maybe we want to show them in another style
    next_month=((month)%12)+1
    pre_month=((month-2)%12)+1 
    day_header=[]
    for i in c.itermonthdays3(year,month):
        k={}
        if i[1]==month:
            k['cur']='c'
        elif  i[1]==next_month:
            k['cur']='n'
        else:
            k['cur']='p'  
        k['name']= month_name[i[1]]+" 1" if i[2]==1 else i[2]
        k['id'] = date(i[0],i[1],i[2]).strftime('%Y-%m-%d')
        day_header.append(k)   
    # make day_event this is a list which it contains 42 list of event bjects 
    con=sql.connect("mdn1.db")
    con.row_factory =dict_factory
    cur=con.cursor()
    uname=session['username']
    day_event=[]
    for i in day_header:
        day_id = i['id'] 
        cur.execute("select event.eventname ,groups.color, event.start,event.eventID,event.endt \
        from event natural join groups where groups.showG=1 and \
            event.date =? and event.username=? order by event.start",(day_id,uname))
        day_event.append(cur.fetchall())
    con.close() 
    
    data={'month_header':month_header,'week_header':week_header,'user':user,\
    'day_header':day_header,'day_event':day_event,'groups':groups}
    return {'data':data}

@app.route('/week_calendar',methods = ['POST','GET'])
@is_logged_in
def week_calendar():
    month,year,dayToV,viewLy,timeInterval,firstDay=data_requst()
    week_header,week_abbr,month_name,month_abbr,c = calendName(firstDay)
    global user
    j=0
    for i in c.itermonthdays4(year,month):
        if (i[1]==month and i[2]==dayToV):
            break
        j+=1
    st=(j//7)*7
    wekk=[]
    for i in c.itermonthdays4(year,month):
        if(st<=0 and st>-7):
            hd=month_abbr[i[1]]+' '+str(i[2])
            wekk.append({'week_head':hd,'id':date(i[0],i[1],i[2]).strftime('%Y-%m-%d'),'weekS':week_abbr[i[3]-firstDay]+' '+hd})
        st-=1
   
    if wekk[0]['week_head'].split(' ')[0]==wekk[-1]['week_head'].split(' ')[0]:
        head_cal_week=wekk[0]['week_head']+'-'+wekk[-1]['week_head'].split(' ')[1]+', '+wekk[-1]['id'].split('-')[0]
    else:
        head_cal_week=wekk[0]['week_head']+'-'+wekk[-1]['week_head']+', '+wekk[-1]['id'].split('-')[0]
    
    t1= datetime(2020,2,2,0,0)   
    con=sql.connect("mdn1.db")
    con.row_factory =dict_factory
    cur=con.cursor()
    uname=session['username']    
    daily_ev=[]
    for j in wekk:       
        aDay=daily_sort(j['id'],uname,cur)
        daily_ev.append(aDay)
    con.close()  
    data = {'head_cal_week':head_cal_week,'wekk':wekk,'user':user,'daily_ev':daily_ev,'groups':groups}
    return {'data':data}
## day calendar MVC 
@app.route('/day_calendar',methods = ['POST','GET'])
@is_logged_in
def day_calendar():
    month,year,dayToV,viewLy,timeInterval,firstDay=data_requst()
    week_header,week_abbr,month_name,month_abbr,c = calendName(firstDay)
    con=sql.connect("mdn1.db")
    con.row_factory =dict_factory
    cur=con.cursor()
    uname=session['username']     
    for i in c.itermonthdays4(year,month):
        if (i[1]==month and i[2]==dayToV):
            cal_header= week_header[i[3]-firstDay]+', '+month_name[i[1]]+' '+str(i[2])+', '+str(year)
            day_data={'cal_header':cal_header,'id':date(i[0],i[1],i[2]).strftime('%Y-%m-%d')}
            t1= datetime(2020,2,2,0,0)   
            day_data['aDay']=daily_sort(day_data['id'],uname,cur)    
            break
    con.close
    data = {'day_data':day_data,'user':user,'groups':groups}
    return {'data':data}

def data_requst():
    data_rec=json.loads(request.form['data'])   
    month = data_rec['month']
    year = data_rec['year']
    dayToV = data_rec['dayToV']
    viewLy=data_rec['viewLy']
    timeInterval=data_rec['timeInterval']
    firstDay=int(data_rec['firstDay'])
    return month,year,dayToV,viewLy,timeInterval,firstDay

def calendName(firstDay):
# month name
    month_name=[]
    for i in calendar_9.month_name:
        month_name.append(i)
# month abbr 
    month_abbr=[]
    for i in calendar_9.month_abbr:
        month_abbr.append(i)
# week name
    week_name=[]
    for i in calendar_9.day_name:
        week_name.append(i)
# week abbr
    week_a=[]
    for i in calendar_9.day_abbr:
        week_a.append(i)
#this is first day of week 0=monday 6=sunday 5=saturday 
    c=calendar_9.Calendar(firstweekday=firstDay)
#make proper week header (to make a list)
    week_header=[]
    week_abbr=[]
    for i in c.iterweekdays():
        week_header.append(week_name[i])
        week_abbr.append(week_a[i]) #make week abbr
    return week_header,week_abbr,month_name,month_abbr,c



##logout
@app.route('/logout')
@is_logged_in
def logout():
    session.clear()
    flash('you logged out')
    return redirect('/')



    
## for del and edit and add events

@app.route('/edit_event', methods = ['POST','GET'])
@is_logged_in
def edit_event():
    jsd = json.loads(request.form['id'])
    con=sql.connect("mdn1.db")
    con.row_factory =dict_factory
    cur=con.cursor()
    #print(jsd)
    if(jsd['st'] =='editEv' or jsd['st'] =='addEv'):
        name,address=jsd['name'],jsd['address']
        uname=session['username']
        date1=jsd['date']
        start=jsd['start']
        endt=jsd['endt']
        groupID =jsd['groupID']
        reminder=jsd['reminder']
        #print(name,address,uname,date1,start,endt,groupID)
    if (jsd['st'] =='editEv'):
        event_id=int(jsd['ido'])
        cur.execute('UPDATE event SET eventname=?,address=?,username=?,date=?,start=?,endt=?,groupID=?, reminder=? WHERE eventID=?',(name,address,uname,date1,start,endt,groupID,reminder,event_id))
        try:
            scheduler.remove_job(str(a))
        except:
            a=0
        #scheduler.remove_job(str(event_id))
        
    if (jsd['st']=='addEv'):
        cur.execute('INSERT INTO event(eventname,address,username,date,start,endt,groupID,reminder)\
                    VALUES (?,?,?,?,?,?,?,?)',(name,address,uname,date1,start,endt,groupID,reminder))
        email=user['email']
        fname=user['fname']
        subjects='PRO-Calendar You Add an event'
        message_body= 'Hello '+fname+', \n You add an event to your pro_calendar.\n The detail is:\n EVENT NAME:\t'\
        +name+'\n ADDRESS:\t'+address+'\n Event Date:\t'+str(date1)+'\n Start Time:\t'+str(start)\
        +'\n End Time:\t'+str(endt)+'\n \n Pro-calendar team'
        send_email(email,message_body,subjects)
            
    if (jsd['st']=='delEv'):
        a=int(jsd['ido'])
        cur.execute('DELETE FROM event WHERE eventID = ?;',(a,))
        date1='2021-03-02'
        try:
            scheduler.remove_job(str(a))
        except:
            a=0
        

    if (jsd['st']=='dayEvents'):
        date1=jsd['day']

    con.commit()
    cur.execute("select * from event where username = ? and date = ? Order by date,start;",(session['username'],date1))
    events =cur.fetchall()
    #add_sch is not in proper place
    add_sch(events,user)    
    con.close()
   
    d1 = date.fromisoformat(date1)
    day_head=d1.strftime('%A, %B %d,%Y' )
    
    day_data={'day_event':events,'day_id':date1,'day_head':day_head}
    print(day_data)
    return {'day_data':day_data}



@app.route('/edit_group', methods = ['POST','GET'])
@is_logged_in
def edit_group():    
    jsd = json.loads(request.form['id'])
    con=sql.connect("mdn1.db")
    cur=con.cursor()
       
    if(jsd['st'] =='editGr' or jsd['st'] =='addGr'):
        name,color=jsd['name'],jsd['color']
        uname,showG=session['username'],True
        #print(name,color,uname,showG)
    
    if (jsd['st'] =='editGr'):
        groupID=int(jsd['groupID'])
        cur.execute('UPDATE groups SET name=?,color=?,username=?,showG=? WHERE groupID=?',(name,color,uname,showG,groupID))
   
    if (jsd['st']=='addGr'):
        cur.execute('INSERT INTO groups(name,username,color,showG) VALUES (?,?,?,?)',(name,uname,color,showG))
        

    if (jsd['st']=='showChange'):        
        cur.execute('UPDATE groups SET showG=? WHERE groupID=?',(jsd['showG'],int(jsd['id'])))

    if (jsd['st']=='delGr'):
        a=int(jsd['id'])
        cur.execute('DELETE FROM groups WHERE groupID = ?;',(a,))
    
    if (jsd['st']=='save_user'):
        global user
        user=jsd['user']
        firstDay=user['firstDay']
        timeInterval=user['timeInterval']
        viewLy=user['viewLy']
        uname=user['username']
        cur.execute('UPDATE users SET firstDay=?,timeInterval=?,viewLy=?  WHERE username=?',(firstDay,timeInterval,viewLy,uname))
 
     
    con.commit()
    con.close()
    con=sql.connect("mdn1.db")
    con.row_factory =dict_factory
    cur=con.cursor()
    cur.execute("select * from groups where username = ?",(session['username'],))
    global groups
    groups =cur.fetchall()
    con.close()
    data={'groups':groups}
    return {'resp':data}


def add_sch(events,user):
    for event in events :
        ind= event['reminder']
        if ind==0 :
            return
        time_before={1:0,2:5,3:15,4:30,5:60,6:120,7:1440,8:1080}
        delta=timedelta(minutes=time_before[ind])
        if ind==8 :
            delta=timedelta(days=7)
        d=event['date']+' '+event['start']
        r_d=datetime.strptime(d,'%Y-%m-%d %H:%M')
        r_d=r_d -delta
        ####this part for test##############
        #r_d=datetime.now()
        #r_d=r_d+timedelta(minutes=1)
        ##################################
        e_id=str(event['eventID'])
        try:
            scheduler.add_job(func=scheduled_task, trigger='date', run_date=r_d,args=[event,user,e_id], id=e_id)
        except:
            continue 

    return

def scheduled_task(event,user,e_id):
    message_body=user['fname']+', you have an upcomming event\n on '+event['date']+' ,at '+event['start']+'\n\
    The event name is '+event['eventname']+'\n\n pro-calendar team'
    subjects='reminder'
    #print(event['eventID'])
       
    send_email(user['email'],message_body,subjects)
    return

def daily_sort(day_id,uname,cur):
    dest=[]
    cur.execute("select event.eventname, event.start, event.endt,\
        groups.name,event.address,groups.color, event.eventID from\
        event natural join groups where\
        groups.showG=1 and  event.date =?  and event.username=?\
        order by event.start ASC,event.endt DESC ",(day_id,uname))
    rest=cur.fetchall()
        
    while(len(rest)>0):
        b=ax(rest)
        dest.append(b)
    return dest

def ax(rest):
    stage=[]
    endt=''
    while(len(rest)>0):
        st=True
        for item in range(len(rest)):
            if rest[item]['start']>=endt:
                stage.append(rest.pop(item))
                endt=stage[-1]['endt']
                duration=toMin(endt)-toMin(stage[-1]['start'])
                stage[-1]['dur']=duration
                stage[-1]['Y_offset']=int(stage[-1]['start'].split(':')[1])

                st=False
                break
        if st:
            break
                    
    return stage
def toMin(time='00:00'):
    a=time.split(':')
    return int(a[0])*60+int(a[1])


def dict_factory(cursor, row):
    d = {}
    for indx, col in enumerate(cursor.description):
            d[col[0]] = row[indx]
    return d


if '__name__'=='__main__':
    app.run(debug=True)