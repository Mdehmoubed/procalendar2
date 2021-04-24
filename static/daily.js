function view(){
    $('#viewShow').text(user.viewLy)
        var data={'viewLy':user.viewLy,'firstDay':user.firstDay,'timeInterval':user.timeInterval,'dayToV':dayToV,'month':month+1 , 'year':year}
        myJSON = JSON.stringify(data);

$.post("/day_calendar",{'data': myJSON},function(resp){
user=resp.data.user
groups=resp.data.groups
head_cal=resp.data.day_data.cal_header
day_id=resp.data.day_data.id
daily_ev=resp.data.day_data.aDay
$('#cal_header').html('<h2>'+head_cal+'</h2>')

//adjust the number of rows to show

m=$('[name="event"]').length
k=user.timeInterval
//n=7*24

//for(i=0 ; i<m-n ; i+=7){$('[name="row"]').eq(0).remove()}
for(i=0 ; i<24-m ; i++){$('[name="row"]').eq(0).before($('[name="row"]').eq(0).clone())}   

//for (i in time_header){$('[name="timee"]').eq(i).text(time_header[i]) }

for (i=0;i<24;i++){
    timeHeader=i.toString().padStart(2,'0')+':00'
    $('[name="timee"]').eq(i).text(timeHeader)             
        
    u=$('[name="event"]').eq(i); u.html('');u.attr('id', day_id+' '+timeHeader);
   
}


a=today.getHours()
b=today.getMinutes()
sa=a.toString().padStart(2,0)
timeid=sa+':00'
ss1='[id="'+day+' ' +timeid+'"]'
$(ss1).append('<div id="currentTime-0" style="z-index:14;background-color:blue;position:relative;height:2px ;top:'+(b-1)+'px"></div>')
$(ss1).append('<div style="z-index:14;background-color:blue;position:relative;height:6px ;top:'+(b-5)+'px; width:6px;left:-4px"></div>')

//$('[id ="currentTime-0"]').blink()
elementToView=document.getElementById(day+' '+timeid)
if (elementToView!==null){elementToView.scrollIntoView();$('[name="timee"]').eq(a).css('color','blue')}
else{$('[name="timee"]').eq(a).css('color','black')}
//
showEList=[]
for (stage in daily_ev){
    ratio= Math.floor(90 / daily_ev.length)
    ratio_s=ratio.toString()+'%'
    X_offset=parseInt(stage)*ratio.toString()+'%'
    for (even in daily_ev[stage]){
        eventi=daily_ev[stage][even]
        loc='[id="'+day_id+' ' + eventi.start.split(':')[0] +':00"]'
        showEList.push(eventi)
        //$(loc).addClass('position-relative')
        subId='Event-d-'+eventi.eventID.toString()
        $(loc).append('<div onclick="showEventW(this)" id='+subId+' class="position-absolute rounded text-truncate" style="z-index:10;opacity:0.85"></div>')
        $('#'+subId).css({'height':eventi.dur,'width':ratio_s,'left':X_offset,'background-color':eventi.color,'top':eventi.Y_offset+'px'})
        $('#'+subId).text(eventi.eventname)
        $('#'+subId).tooltip( {title:eventi.start+" to "+eventi.endt+' '+eventi.eventname,trigger:'hover', placement: "bottom",delay: { "show": 100, "hide": 100 }})
    }
}
$('[name="eventlist"]').eq(0).show()
a=$('[name="eventlist"]').eq(0).clone()

if(showEList.length>0) {$('[name="eventlist"]').remove()} 
else{$('[name="eventlist"]').hide()}





for (i in showEList){
    $('#listCon').after(a.clone())
    item=showEList[i]
    $('[name="groList"]').eq(0).text(item.name)
    $('[name="groList"]').eq(0).css('background-color',item.color) 
    $('[name="titleL"]').eq(0).text(": "+item.eventname)
    if (item.address==''){$('[name="descri"]').eq(0).prev().remove();$('[name="descri"]').eq(0).remove()}
    else{ $('[name="descri"]').eq(0).text(": "+item.address)}
    if (item.start=='00:00' & item.endt=='23:59'){text=': All Day'}
    else{text=': from '+item.start+' to '+ item.endt}
    $('[name="timeEvnt"]').eq(0).text(text)

}







viewCom()


}) }

function forward(){
var a=today
a.setDate(a.getDate()+1)
month=a.getMonth()
year=a.getFullYear()
dayToV=a.getDate()
view()
}

function back(){
var a=today
a.setDate(a.getDate()-1)
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