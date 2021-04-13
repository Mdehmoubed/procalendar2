$('[id |="addG"]').hide()
t1= new Date('06-24-2020');
var today= new Date();
var formChange=false     
var day =new Date(today.getTime() - (today.getTimezoneOffset() * 60000 )).toISOString().split('T')[0]
var month=today.getMonth();
var year=today.getFullYear();
var dayToV=today.getDate();
$("#userShow").text(user.fname)
                
$("[name='first_day']").click(function() {fd=parseInt(($(this).val()));user.firstDay=fd; setUser()});
$("[name='timeInt']").click(function() {ti=parseInt($(this).val());user.timeInterval=ti;  setUser()});

$(document).ready(function(){           
    $("#backward").click(function(){back()}) ,
    $("#forward").click(function(){forward()}) ,
    $("#logout1").click(function(){window.location.href='/logout'}) ,
    $('[name="view"]').click(function(){user.viewLy=$(this).text();
        setUser();window.location.href ='/dashboard'}) ,
    $('#setting1').click(function(){$('#msetting').modal();}),
    $('#group1').click(function(){$('#mgroup').modal()}) ,
    $('#event1').click(function(){$('#addEventForm')[0].reset();
        $('[id |="eventT"]').attr('hidden',false);$('#m_add_event').modal();}) ,
    $("#AccountChange").click(function(){edit_user()}),
    //$("#allDay").change(function(){$('[id |="eventT"]').attr('hidden',this.checked)}) ,
    $('#adE').click(function(){addEventByD(this)}) ,  
            
    view()

})
function setUser(){
    var send={'st':'save_user','user':user}
    myJSON = JSON.stringify(send);
    $.post( "/edit_group", {'id': myJSON},function(data){view()})
    
} 
function delGroup(e){m=e.parentElement.id.slice(6,)
    var send={'st':'delGr','id':m }
    myJSON = JSON.stringify(send);
    $.post( "/edit_group", {'id': myJSON},function(data){view()})
}
function changroup(a){for (i in groups){
   if(groups[i].groupID==$(a).val()){
       $(a).css('background-color',groups[i].color)}
}}
function changeshow(e){m=e.parentElement.id.slice(6,)
    showG=e.checked;
    var send={'st':'showChange','id':m ,'showG':showG }
    myJSON = JSON.stringify(send);
    $.post( "/edit_group", {'id': myJSON},function(data){view()})
}

function allDayChange(a){b=a.parentElement.parentElement
    $(b).find('[id |="eventT"]').attr('hidden',a.checked)
    if (a.checked){
        $(b).find('[id |="end"]').val('23:59')
        $(b).find('[id |="start"]').val('00:00')}
    else{
        changeEnd($(b).find('[id |="start"]')[0])
    }       
}

function changeEnd(a){b=a.parentElement.parentElement
    k=user.timeInterval          
    $(b).find('[id |="end"]').html(''); et1=$('#start').children().eq(0).clone()
    st= $(b).find('[id |="start"]').val()
    t1.setHours(st.slice(0,2),st.slice(3,5),0,0)
    h=parseInt(st.slice(0,2))*60+parseInt(st.slice(3,5))
    //alert(i)
    for (i=0 ;i<24*60-h-k;i+=k){
        t1.setMinutes(t1.getMinutes()+k);p=t1.toTimeString().slice(0,5)
        et1.html(p);et1.val(p); $(b).find('[id |="end"]').append(et1.clone()) }
        et1.html('23:59');et1.val("23:59"); $(b).find('[id |="end"]').append(et1.clone()) 
}  

function checkEvent(){
   var a= ($('#start').val()=="")||($('#end').val()=="")||($('#date').val()=="")||($('#title').val()=="")
   //add some code to check overlaping time ,....
   if (a) {alert ('some fild doesnt fill'); return}
   $('#addEventBtn').prop('disabled',true);reminder=$('#reminder').val()
   title=$('#title').val(); address=$('#descr').val() ; date=$('#date').val()
   if (document.getElementById('allDay').checked){start='00:00';endt='23:59'}
        else{start=$('#start').val(); endt=$('#end').val();}
   groupID=$('#group_list').val()
   var send={'st':'addEv','name':title , 'address':address ,'date':date ,'start':start,'endt':endt,'groupID':groupID,'reminder':reminder}
       myJSON = JSON.stringify(send);
       $.post( "/edit_event", {'id': myJSON},function(data){
            $('#addEventBtn').prop('disabled',false)
            $('#m_add_event').modal('hide')
            view()  
        })               
}
function addEventByD(a){
    $("#mdayEvent").modal('hide')
    $('#addEventForm')[0].reset();
    $('[id |="eventT"]').attr('hidden',false);
    $('#addEventForm').children().show()
    $('#date').val(a.name)
    $("#m_add_event").modal()

}

function delEvent(a){
    var send={'st':'delEv','ido': a.parentElement.id.slice(7,)};
    myJSON = JSON.stringify(send);
       $.post( "/edit_event", {'id': myJSON},function(data){view()
        $("#mdayEvent").modal('hide')
        //$("#mdayEvent").modal()
    })
}
function editEvent(a){p=a.parentElement.id ; pid=p.slice(7,)
    if ($('#'+p).find('[id |="delEv"]').attr('disabled')){
        title=$('#'+p).find('[id |="title"]').val();
        groupID=$('#'+p).find('[id |="group_list"]').val();
        date=$('#'+p).find('[id |="date"]').val();
        a = $('#'+p).find('[id |="allDay"]').prop('checked')
        if(a){start='00:00';endt='23:59'}
        else{ start=$('#'+p).find('[id |="start"]').val();
                endt=$('#'+p).find('[id |="end"]').val();}
        
        reminder=$('#'+p).find('[id |="reminder"]').val();
        address=$('#'+p).find('[id |="descr"]').val();
        

        if ((title)==''){alert ('some fild doesnt fill'); return}
        $('#'+p).find('*').attr('disabled',true)
        var send={'st':'editEv','ido': pid,'name':title , 'address':address ,'date':date ,'start':start,'endt':endt,'groupID':groupID,'reminder':reminder};
        myJSON = JSON.stringify(send);
        $.post( "/edit_event", {'id': myJSON},function(data){$("#mdayEvent").modal('hide'); view()})             
    }        
    else{
    $('#'+p).find('*').attr('disabled',false)
    $('#allDay-'+p).show()
    $('#'+p).find('[id |="delEv"]').attr('disabled',true)
    $('#'+p).find('[id |="editEv"]').html('<i class="fas fa-calendar-check"> Save Event </i>')
    }
}
function dayEvents(day){ 
    var send={'st':'dayEvents','day': day};
    myJSON = JSON.stringify(send);
       $.post( "/edit_event", {'id': myJSON},function(data){
          $('#modalDate').text(" Events on "+data.day_data.day_head) 
          event= data.day_data.day_event
          a=$('#adE'); a.attr('name',data.day_data.day_id)
          if (event.length ==0) {$('#mEvent').hide()}
          else{
                $('#mEvent').show() 
                e=$('[id|="eventL"]').eq(0); $('[id|="eventL"]').remove();$('[id|="eventF"]').remove()
                ta=$('<div class="collapse" data-parent="#mEvent"></div>'); tb=$('#addEventForm')
                
                for (i in event ){
                    eL=event[i]
                    for ( j in groups){
                        if (groups[j].groupID == eL.groupID){ gr=groups[j];break }
                    }
                    divi='eventL-'+eL.eventID.toString();divt='eventF-'+eL.eventID.toString();
                    e=e.clone(); e.attr('id',divi); e.attr('data-target','#'+divt) 
                    e.css('background-color',gr.color);  
                    e.html('<div class="ml-2"></div><div class="ml-auto"></div>')              
                    e.children().eq(0).text(eL.eventname); e.children().eq(1).html('<i class="fas fa-angle-down rotate-icon"></i>')
                     $('#mEvent').append(e);
                    
                    t=ta.clone(); t.attr('id',divt); tc=tb.clone();tc.attr('id','fE-'+divt)
                    a=tc.find('#group_list');a.attr('disabled',true);a.val(gr.groupID);a.css('background',gr.color);a.attr('id',a.attr('id')+'-'+divt)
                    a=tc.find("#title");a.attr('disabled',true);a.attr('id',a.attr('id')+'-'+divt);a.val(eL.eventname)
                    a=tc.find("#date");a.attr('disabled',true);a.attr('id',a.attr('id')+'-'+divt);a.val(eL.date)
                    a=tc.find("#start");a.attr('disabled',true);a.attr('id',a.attr('id')+'-'+divt);a.val(eL.start)
                    if (eL.endt=='23:59'){enn='00:00'}else{enn=eL.endt}
                    a=tc.find("#end");a.attr('disabled',true);a.attr('id',a.attr('id')+'-'+divt);a.val(enn)
                    a=tc.find('[id |= "eventT"]');a.attr('id',a.attr('id')+'-'+divt);
                    a=tc.find("#allDay");a.attr('disabled',true);a.attr('id',a.attr('id')+'-'+divt);a.prop('checked',(enn=='00:00' &  eL.start =='00:00'))
                    a=tc.find("#reminder");a.attr('disabled',true);a.attr('id',a.attr('id')+'-'+divt);a.val(eL.reminder)
                    a=tc.find("#descr");a.attr('disabled',true);a.attr('id',a.attr('id')+'-'+divt);a.val(eL.address)
                    t.append(tc)
                    b='<button  id="delEv-'+eL.eventID+'" onclick="delEvent(this)"  class="btn btn-danger "><i class="fas fa-calendar-times"> Delete Event </i></button>'
                    t.append(b);
                    b='<button  id="editEv-'+eL.eventID+'"onclick="editEvent(this)" class="btn btn-warning float-right"><i class="fas fa-edit"> Edit Event </i></button>'
                    t.append(b) 
                    if (i==0){t.addClass('show')}
                                     
                    
                    $('#mEvent').append(t); 
                    
                }
                
                   
          }    
        
        })   

}


function addGroup(){
    if ($('#addGroup').html()=='Add New Group <i class="far fa-plus-square"></i>'){
        $('[name |="g-bu"]').hide()           
        $('#addGroup').html('<i class="far fa-plus-square"></i>')
        $('[id |="addG"]').show()
        $('#addG-no').hide()
    }
    else{ 
        if ($('#addG-Name').val()==""){$('#addG-no').show('slow') ;return}
        gname=$('#addG-Name').val()
        gcolor=$('#addG-Color').val()
        var send={'st':'addGr','name':gname , 'color':gcolor }
        myJSON = JSON.stringify(send);
        $.post( "/edit_group", {'id': myJSON},function(data){ 
            addGrCancel(); view()
            })
    }
}
function addGrCancel(){
    $('[name |="g-bu"]').show();$('#addGroup').show() 
    $('#addGroup').html('Add New Group <i class="far fa-plus-square"></i>')
    $('[id |="addG"]').hide();
    $('#addG-no').hide();
       
}

function editGroup(e){
    m='#'+e.parentElement.id
    eb=$(m +'>[name="g-bu-e"]')
    if (eb.html()=='<i class="fas fa-edit"></i>'){
        $('[name |="g-bu"]').hide();$('#addGroup').hide() 
        eb.html('<i class="far fa-check-square"></i>'); eb.show();
        $(m).children().attr('disabled',false)
        $('[name=showG]').attr('disabled',true)          
        }
    else{   
        if ($(m+'>[name="g-pr-name"]').val()==""){$('#addG-no').show();return}
        gname=$(m+'>[name="g-pr-name"]').val()
        gcolor=$(m+'>[name="g-pr-color"]').val()
        groupID=e.parentElement.id.slice(6,)               
        var send={'st':'editGr','name':gname , 'color':gcolor,'groupID':groupID }
        myJSON = JSON.stringify(send);  
        $.post( "/edit_group", {'id': myJSON},function(){
            $(eb).html('<i class="fas fa-edit"></i>')
            $(m).children().attr('disabled',false)
            $(m +'>[name |="g-pr"]').attr('disabled',true)
            eb.html('<i class="fas fa-edit"></i>')     
            addGrCancel();view()  })
    }       
    return
}


function edit_user(){
    $('#eform')[0].reset()
    formChange=false
    $('#notsame').hide()
    $('#uname').val(user.username)
    $('[name="iemail"]').val(user.email)
    $('[name="psw"]').val(user.password )
    $('[name="repsw"]').val(user.password)
    $('[name="fname"]').val(user.fname)
    $('[name="lname"]').val(user.lname)
    $("#edit_user").modal();

}

function checkAll(){
    if ( $('[name="psw"]').val()!=$('[name="repsw"]').val()) {
        $('#notsame').show()
        return false}
        $("#edit_user").modal('hide');
    return formChange
}




function viewCom(){
    //add listiner for each day 
    $('.col.border.rounded').off()         
    $('.col.border.rounded').click(function(){clickOnCell(this)})
      

     // making option for time slots
    k=user.timeInterval
    $('#start').html('<option>00:00</option>'); et1=$('#start').children().clone();$('#end').html('')
    t1.setHours(0,0,0,0)
    for (i=0 ;i<24*60;i+=k){
        t1.setMinutes(t1.getMinutes()+k);p=t1.toTimeString().slice(0,5)
        et1.html(p);et1.val(p);$('#start').append(et1.clone());$('#end').append(et1.clone())
    }
    $('#end').children().eq(-1).html('23:59')

    //making options for reminder
    var rem= ["Not Reminder","at time of Event","5 minute before","15 minute before","30 minute before" ,'1 hour before','2 hours before','1 Day before','1 Week before']
    ind=$('#reminder')
    ind.html('<option></option>');e=ind.children();ind.html('')
    for (i in rem){
        e.html(rem[i]);e.val(i)
        ind.append(e.clone())
        }

    a='#startWeek > #startWeek'+user.firstDay.toString() 
    $(a).prop('checked',true);
    a='#timeSlot > #t'+user.timeInterval.toString() 
    $(a).prop('checked',true);

    //making group for list to add event and group-menu    
    e=$('[id|="group"]').eq(0);  m=$('[id|="grList"]').eq(0); 
    $('[id|="group"]').remove();   $('[id|="grList"]').remove()
    for (i in groups){
        gr=groups[i];
        gop ='grList-'+gr.groupID.toString(); //group option list
        gdiv ='group-'+ gr.groupID.toString(); //in group menu
        e = e.clone(); e.attr('id',gdiv); e.children().eq(1).val(gr.name)
        e.children().eq(2).val(gr.color); e.children().eq(0).prop("checked",gr.showG);
        $('#addGr').before(e);
        m = m.clone(); m.attr('id',gop);m.css('background-color',gr.color)
        m.val(gr.groupID) ;m.html(gr.name); $('#group_list').append(m) 
    }
    
    if (groups.length<2){ $('[name=delGroup]').hide()}
    //$('#group_list').val(groups[0].name)
    
    $('#group_list').css('background-color',groups[0].color)
    return
}