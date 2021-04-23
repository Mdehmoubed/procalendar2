

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
    daily_ev=resp.data.daily_ev
    $('#cal_header').html('<h2>'+head_cal_week+'</h2>')
    for (i in wekk){
        $('.col.m-1.border.border-success').eq(i).text(wekk[i].weekS)          
    }
//adjust the number of rows to show

    m=$('[name="event"]').length
    k=user.timeInterval
    //n=7*24

    //for(i=0 ; i<m-n ; i+=7){$('[name="row"]').eq(0).remove()}
    for(i=0 ; i<7*24-m ; i+=7){$('[name="row"]').eq(0).before($('[name="row"]').eq(0).clone())}   
    
    //for (i in time_header){$('[name="timee"]').eq(i).text(time_header[i]) }

    for (i=0;i<24;i++){
        timeHeader=i.toString().padStart(2,'0')+':00'
        $('[name="timee"]').eq(i).text(timeHeader) 
        for (j=0;j<7;j++){
            
            u=$('[name="event"]').eq(i*7+j); u.html('');u.attr('id', wekk[j].id+' '+timeHeader);

        }
        
    }
    
    
a=today.getHours()
b=today.getMinutes()
sa=a.toString().padStart(2,0)
timeid=sa+':00'
ss1='[id="'+day+' ' +timeid+'"]'
$(ss1).append('<div id="currentTime-0" style="z-index:14;background-color:red;position:relative;height:2px ;top:'+b+'px"></div>')
$(ss1).parent().children().eq(1).append('<div  id="currentTime-1" style="z-index:12;background-color:Cyan;position:absolute;height:1px ;width:700%;top:'+b+'px"></div>')
//$('[id ="currentTime-0"]').blink()
elementToView=document.getElementById(day+' '+timeid)
if (elementToView!==null){elementToView.scrollIntoView()}
//

for (i=0;i<7;i++){
    for (j in daily_ev[i]){
        ratio= Math.floor(100 / daily_ev[i].length)
        ratio_s=ratio.toString()+'%'
        X_offset=parseInt(j)*ratio.toString()+'%'
        for (even in daily_ev[i][j]){
            eventi=daily_ev[i][j][even]
            loc='[id="'+wekk[i].id+' ' + eventi.start +'"]'
            //$(loc).addClass('position-relative')
            subId='Event-d-'+eventi.eventID.toString()
            $(loc).append('<div onclick="showEventW(this)" id='+subId+' class="position-absolute rounded text-truncate" style="z-index:10;opacity:0.85"></div>')
            $('#'+subId).css({'height':eventi.dur,'width':ratio_s,'left':X_offset,'background-color':eventi.color,'top':eventi.Y_offset+'px'})
            $('#'+subId).text(eventi.eventname)
            $('#'+subId).tooltip( {title:eventi.start+" to "+eventi.endt+' '+eventi.eventname,trigger:'hover', placement: "bottom"})
        }
        

    }

    
    


}





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

function showEventW(a){
    bypass=$(a).parent().attr('id').slice(0,10)
    //alert(bypass)
    dayEvents(bypass,true,a.id.slice(8,))
    $("#mdayEvent").modal()
}    


function clickOnCell(a){

    a=$(a).attr('id')
    
    if(a.slice(0,10)!=bypass){
    dayEvents(a.slice(0,10),false,0);  $("#mdayEvent").modal()
    bypass=''
    }

    //alert(a.id.slice(0,10))//+" ,left= "+ $(a).offset().left+',top='+ $(a).offset().top)
    //$('#viewz').css({'background-color':'red','width':'50px','height':'50px', 'z-index':'-100'})
    
    
    }
    
    