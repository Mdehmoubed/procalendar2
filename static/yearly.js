function view(){
    $('#viewShow').text(user.viewLy)
    var data={'viewLy':user.viewLy,'firstDay':user.firstDay,'timeInterval':user.timeInterval,'dayToV':dayToV,'month':month+1 , 'year':year}
    myJSON = JSON.stringify(data);
    $.post("/year_calendar",{'data': myJSON},function(resp){
    user=resp.data.user
    groups=resp.data.groups
    month_name=resp.data.month_name
    week_header=resp.data.week_header
    cell_id=resp.data.cell_id
    eventE=resp.data.day_event
    $('#cal_header').html('<h2>'+year+'</h2>')
    month_c = $('[name="month_c"]')
    a=month_c.eq(0).clone()
    //a.find('[name="eventY"]').html('')
    for (i=0;i<7;i++){
        a.find('[name="week_head"]').eq(i).text(week_header[i])        
    }        
    for (mon in cell_id ){
        mon_name=month_name[parseInt(mon)+1];mon_key=parseInt(mon);mon_item=cell_id[mon]
        a.find('[name="month_h"]').text(mon_name)
        week_1=a.find("[name='new_row']")
        week_1_item = week_1.eq(0).clone()
        for (i=week_1.length;i<mon_item.length;i++){a.append(a.find("[name='new_row']").eq(0).clone()) }
        for (i=mon_item.length;i<week_1.length;i++){week_1.eq(0).remove()}
        i=0
        for (w of mon_item){
            for(d of w){
                if (d==''){
                    text='' 
                    a.find('[name|="cell"]').eq(i).attr('name','cell-1')                  
                }
                else{
                    text=parseInt(d.split('-')[2]).toString()
                    a.find('[name|="cell"]').eq(i).attr('id',d)                    
                }
                a.find('[name|="cell"]').eq(i).html("<div style='height:20px' class='p-0'>"+text+
                "</div><div style='height:20px ;  display:flex;justify-content:space-between;' name='event'  class='p-0'></div>")
                i++
            }
        }        
        $('[name="month_c"]').eq(mon_key).html(a.html()) 
    }

    $('#'+day).css('background-color','lightgreen')
        
    for (s_ev of eventE){
               
        a=$('#'+s_ev.date).find('[name="event"]').eq(0)
        
        a.append('<div onclick="showEvent(this)"></div>')
        a.children().eq(-1).css({'height':'80%','min-width':'14%','background-color':s_ev.color})
        a.children().eq(-1).attr('id',s_ev.eventID)
        $('#'+s_ev.eventID).tooltip( {title:s_ev.start+" to "+s_ev.endt+' '+s_ev.eventname,trigger:'hover', placement: "bottom",delay: { "show": 100, "hide": 100 }})
    }
       
   

    viewCom();

}) 


}


function forward(){
 year ++
view() }

function back(){
 year --
view()   }

function showEvent(a){
bypass=$(a).parent().parent().attr('id')
dayEvents(bypass,true,a.id)
$("#mdayEvent").modal()
}    



function clickOnCell(a){
if (a.id!=bypass) {dayEvents(a.id,false,0);  $("#mdayEvent").modal()}
bypass=''
}