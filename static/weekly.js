

function view(){
    $('#viewShow').text(user.viewLy)
            var data={'viewLy':user.viewLy,'firstDay':user.firstDay,'timeInterval':user.timeInterval,'dayToV':dayToV,'month':month+1 , 'year':year}
            myJSON = JSON.stringify(data);
   
$.post("/week_calendar",{'data': myJSON},function(resp){
    //user=resp.data.user
    //groups=resp.data.groups
    head_cal_week=resp.data.head_cal_week
    wekk=resp.data.wekk
    daily_ev=resp.data.daily_ev
    $('#cal_header').html('<h2>'+head_cal_week+'</h2>')
    for (i in wekk){
        $('.col.m-1.border.rounded-circle').eq(i).text(wekk[i].weekS) 
        if(wekk[i].id==day){
            $('.col.m-1.border.rounded-circle').eq(i).append('<div style="z-index:14;background-color:blue;position:relative;height:12px "></div>')
               
        }          
    }
//adjust the number of rows to show

    m=$('[name="cell"]').length
   

    //for(i=0 ; i<m-n ; i+=7){$('[name="row"]').eq(0).remove()}
    for(i=0 ; i<7*24-m ; i+=7){$('[name="row"]').eq(0).before($('[name="row"]').eq(0).clone())}   
    
    //for (i in time_header){$('[name="timee"]').eq(i).text(time_header[i]) }

    for (i=0;i<24;i++){
        timeHeader=i.toString().padStart(2,'0')+':00'
        $('[name="timee"]').eq(i).text(timeHeader) 
        for (j=0;j<7;j++){
            
            u=$('[name="cell"]').eq(i*7+j); u.html('');u.attr('id', wekk[j].id+' '+timeHeader);

        }
        
    }
    
    
a=today.getHours()
b=today.getMinutes()
sa=a.toString().padStart(2,0)
timeid=sa+':00'
ss1='[id="'+day+' ' +timeid+'"]'
$(ss1).append('<div id="currentTime-0" style="z-index:14;background-color:blue;position:relative;height:2px ;top:'+(b-1)+'px"></div>')
$(ss1).append('<div style="z-index:14;background-color:blue;position:relative;height:6px ;top:'+(b-5)+'px; width:6px;left:-4px"></div>')
$(ss1).parent().children().eq(1).append('<div  id="currentTime-1" style="z-index:12;background-color:Cyan;position:absolute;height:1px ;width:700%;top:'+(b-1)+'px"></div>')


//$('[id ="currentTime-0"]').blink()
elementToView=document.getElementById(day+' '+timeid)
if (elementToView!==null){elementToView.scrollIntoView();$('[name="timee"]').eq(a).css('color','blue')}
else{$('[name="timee"]').eq(a).css('color','black')}
//

for (i=0;i<7;i++){
    for (j in daily_ev[i]){
        ratio= Math.floor(90 / daily_ev[i].length)
        ratio_s=ratio.toString()+'%'
        X_offset=parseInt(j)*ratio.toString()+'%'
        for (even in daily_ev[i][j]){
            eventi=daily_ev[i][j][even]
            loc='[id="'+wekk[i].id+' ' + eventi.start.split(':')[0] +':00"]'
            //$(loc).addClass('position-relative')
            subId='Event-d-'+eventi.eventID.toString()
            $(loc).append('<div onclick="showEventW(this)" id='+subId+' class="position-absolute rounded text-truncate" style="z-index:10;opacity:0.85"></div>')
            $('#'+subId).css({'height':eventi.dur,'width':ratio_s,'left':X_offset,'background-color':eventi.color,'top':eventi.Y_offset+'px'})
            $('#'+subId).text(eventi.eventname)
            $('#'+subId).tooltip( {title:eventi.start+" to "+eventi.endt+' '+eventi.eventname,trigger:'hover', placement: "bottom",delay: { "show": 100, "hide": 100 }})
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
    }
    bypass=''
    
    }
    
    