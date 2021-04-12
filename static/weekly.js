
function view(){
    $('#viewShow').text(user.viewLy)
            var data={'viewLy':user.viewLy,'firstDay':user.firstDay,'timeInterval':user.timeInterval,'dayToV':dayToV,'month':month+1 , 'year':year}
            myJSON = JSON.stringify(data);
   
$.post("/week_calendar",{'data': myJSON},function(resp){
    user=resp.data.user
    groups=resp.data.groups
    head_cal_week=resp.data.head_cal_week
    wekk=resp.data.wekk
    time_header=resp.data.time_header
    time_event=resp.data.time_event
    $('#cal_header').html('<h2>'+head_cal_week+'</h2>')
    for (i in wekk){
        $('.col.m-1.border.border-success').eq(i).text(wekk[i].weekS)          
    }
//adjust the number of rows to show

    m=$('[name="event"]').length
    k=user.timeInterval
    n=7*24*60/k

    for(i=0 ; i<m-n ; i+=7){$('[name="row"]').eq(0).remove()}
    for(i=0 ; i<n-m ; i+=7){$('[name="row"]').eq(0).before($('[name="row"]').eq(0).clone())}   
    
    for (i in time_header){$('[name="timee"]').eq(i).text(time_header[i])
   
    }
    for (i in time_event){
        u=$('[name="event"]').eq(i); u.html('');u.parent().attr('id', wekk[i%7].id+' '+time_header[Math.floor(i/7)]); u.parent().removeClass('border-danger')  
        for (j in time_event[i]){
            u.append('<div class="col text-truncate" style="background-color:'+time_event[i][j].color+'" name='+
            time_event[i][j].eventID+'>'+time_event[i][j].eventname+'</div>')                   
        }
    }          

    


a=today.getHours()
b=today.getMinutes()
b -=(b%k)
sa=a.toString().padStart(2,0)
sb=b.toString().padStart(2,0)
timeid=sa+':'+sb
ss1='[id="'+day+' ' +timeid+'"]'
$(ss1).addClass('border-danger')  

viewCom()

}) }

function forward(){
var a=today
a.setDate(a.getDate()+7)
month=a.getMonth()
year=a.getFullYear()
dayToV=a.getDate()
view()
}

function back(){
var a=today
a.setDate(a.getDate()-7)
month=a.getMonth()
year=a.getFullYear()
dayToV=a.getDate()
view()    }


function clickOnCell(a){
    dayEvents(a.id.slice(0,10));  $("#mdayEvent").modal()

    //alert(a.id.slice(0,10))//+" ,left= "+ $(a).offset().left+',top='+ $(a).offset().top)
    //$('#viewz').css({'background-color':'red','width':'50px','height':'50px', 'z-index':'-100'})
    
    
    }