//         Heavily Modified CTFd/themes/admin/static/js/chalboard.js Functions
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function loadchals2(){
    $('#challenges2').empty();
    $('#challenges2').append($('<center><span title="Toggle Challenge Discovery"><label class="switch"><input id="check" type="checkbox" onclick="updateStatus()"><span class="slider"></span></label></span></center>'))
    //$('#challenges2').append($('<span title="Auto Discovery" style="display:none"><label class="switch"><input id="auto" type="checkbox" onclick="updateAuto()"><span class="slider"></span></label></span>'))
    $('#challenges2').append($('<span title="Auto Discovery"><button class="auto-button col-md-2 " style="background:lightblue;border-radius: 30%;" onclick="updateAuto2()"><h3>Add</h3><h5>Auto-Discovery</h5></button></span>'))
    $('#challenges2').append($('<span title="Are you sure?"><button class="delete-button col-md-2 " style="background: rgb(222, 139, 136);border-radius: 30%;color:white;" onclick="deleteAll()"><span class="delete-off"><h3>Delete</h3><h5>All Discovery Sets</h5></span><span class="delete-on" style="display:none;"><h3>DELETE</h3><h5>EVERYTHING?</h5></span></button></span><center class="preview0"><span class="preview"></center>'))

    $('.preview').append('<tr class="preview2">');$('.preview2').append('<button style="background: #affaae; color: black; border-radius: 30%" class="preview-button" onclick="setTimeout(preview(), 0)"><h3>Preview</h3></button></tr></span><tr id="disc-drop-0"><div id="current-discoveryList-0" style="display: none;"></div><div id="chal-discoveryList-0" style="display: none;"></div>');$('.preview-button').append('</tr>');

    $.post(script_root + "/admin/chals", {
        'nonce': $('#nonce').val()
    }, function (data) {
        categories = [];
        challenges = $.parseJSON(JSON.stringify(data));
        chalList = [];

        chal_ordered = [];
        categories = [];
        categories_list =[[]]

        for (var i = 0; i <= challenges['game'].length - 1; i++) {  //find all categories
            if ($.inArray(challenges['game'][i].category, categories) == -1) {
               categories.push(challenges['game'][i].category)
               current_cat=[]
               for (var k = challenges['game'].length - 1; k >= 0; k--) { //find all chals in each category
                   if (challenges['game'][k].category == challenges['game'][i].category) {
                       current_cat.push(challenges['game'][k])
                       chalList.push([challenges['game'][k].id,challenges['game'][k].name])
                   }
               }
               current_cat=quicksort(current_cat);
               categories_list.push(current_cat);
               chal_ordered.push(...current_cat)
            }
        }

        for (var i = 1; i < categories_list.length; i++){
            $('#challenges2').append($('<tr id="' + categories[i-1] + '"><td class="col-md-1"><h2>' + categories[i-1] + '</h2></td></tr>'))
            //console.log('cat');console.log(categories_list[i])
            for (var x = 0; x < categories_list[i].length; x++){
                challenge = categories_list[i][x];
                //console.log('chal');console.log(categories_list[i][x])
                var chalDisc = '<table class="discovery" id="discovery-{0}" value="{1}" cellspacing="0" cellpadding="0" style="display: inline-block;"></table></br></br></br></br>'.format(challenge.id, challenge.name);
                
                $('#challenges2').append($(chalDisc));
                
                $('#discovery-'+challenge.id).append('<tr id="disc-drop-'+challenge.id+'"><td><button class="chal-button col-md-2" style="background:grey;" value="{0}"><h5>{1}</h5><p>{2}</p><h3 style="display:none;padding-top:12px;padding-bottom:12px;margin-top:5px;">UPDATE</h3></button></td><td><div id="current-discoveryList-{0}" style="display: none;"></div><div id="chal-discoveryList-{0}" style="display: none;"></div>'.format(challenge.id, challenge.name, challenge.value));
              
               $('#disc-drop-'+challenge.id).append(builddiscovery(challenge.name, challenge.id, chal_ordered));

               $('#disc-drop-'+challenge.id).append($('</td></tr>'));
               
               $.get(script_root + '/admin/discoveryList/' + challenge.id, function(data){
                  discoveryList = $.parseJSON(JSON.stringify(data));
                  discoveryList = discoveryList['discoveryList'];
                  counter = 0
                  for (var j = 0; j < discoveryList.length; j++) { //For each ANDed set
                      counter2 = 0
                      andSet = []
                      andSet2 = []
                      list = discoveryList[j].discovery.split("&");
                      for (var k=0; k < list.length; k++){
                          for (var l=0; l<chalList.length; l++){
                              if(chalList[l][0]==list[k]){
                                  andSet.push(chalList[l][1]);
                                  andSet2.push(chalList[l][0]);
                              }
                          }
                      }
                  
 
                      discovery = "<td style='background-color: #4bcdcd; border: 1px solid #dddddd;' id='NeededSet-"+(discoveryList[j].chal)+"-"+counter+ "'><span class='chal-discovery discovery-"+ (discoveryList[j].chal) + "' value='"+ discoveryList[j].chal +"'>"
                      
                      for (var k=0; k < andSet.length; k++){
                          discovery += "<p id='Needed-"+(discoveryList[j].chal)+'-'+counter+'-'+counter2+"' style='color:red;' value='"+andSet2[k]+"'>"+andSet[k]+"</p>"
                          counter2++;
                      }
                      counter++;
                      discovery += "</span><a name='"+discoveryList[j].id+"'' class='delete-discovery' id='"+ discoveryList[j].chal +"'>&#215;</a></span></td>";
                      $('#discovery-'+discoveryList[j].chal).append(discovery);
                  }
                  $('.delete-discovery').click(function(e){
                      deletediscovery(e.target.name);
                      $(e.target).parent().remove();
                      loaddiscoveryList(e.target.id);
                  });
               });
               
            }
        }      
        

        $('.chal-button').click(function (e) {
            id = this.value
            updatediscoveryList(id);
            loadAuto();
            loadStatus();
        });


        $('.chal-button').mouseenter(function (e) {
            id = this.value
            
            $(this).css({"border-radius": "50%", "color": "white" , "background" : "red"})
            $("#disc-drop-"+id+" p").hide()
            $("#disc-drop-"+id+" h5").hide()
            $("#disc-drop-"+id+" h3").show()
            
        });
        $('.chal-button').mouseleave(function (e) {
            id = this.value
            
            $(this).css({"border-radius": "0%", "color" : "white", "background" : "grey"});
            $("#disc-drop-"+id+" p").show()
            $("#disc-drop-"+id+" h5").show()
            $("#disc-drop-"+id+" h3").hide()
        });

        $('.auto-button').mouseenter(function (e) {           
            $(this).css({"border-radius": "100%","color": "white" , "background" : "#337ab7"})
        });
        $('.auto-button').mouseleave(function (e) {
            $(this).css({"border-radius": "30%","color" : "black", "background" : "lightblue"});
        });
        $('.preview-button').mouseenter(function (e) {           
            $(this).css({"border-radius": "100%","color" : "white", "background" : "#de9191"})
        });
        $('.preview-button').mouseleave(function (e) {
            $(this).css({"border-radius": "30%","color": "black" , "background" : "#affaae"});
        });
        $('.delete-button').mouseenter(function (e) {           
            $(this).css({"border-radius": "100%", "color": "white" , "background" : "#c83232"})
            $('.delete-off').hide()
            $('.delete-on').show()
        });
        $('.delete-button').mouseleave(function (e) {
            $(this).css({"border-radius": "30%", "color" : "#f5eeed", "background" : "#de8b88"});
            $('.delete-on').hide()
            $('.delete-off').show()
        });
        $('.preview').append('<tr class="preview1">');$('.preview1').append(builddiscovery('', 0, chal_ordered));$('.preview').append('</tr>');

    });
 
}


$(function(){
    loadchals2();
    loadALLdiscoveryList();
    loadStatus();
})

//         Challenge Discovery JS
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


function preview(){
  solved = [];
  
  //setTimeouts are used to keep control of raceconditions when preview
  //is exexuted more than once before reloading page

  setTimeout(function(){
      $('#chal-discoveryList-0 > span').each(function(i, e){
          solved.push($(e).text());
      });
  }, 0);
  
  setTimeout(function(){ loadchals2(); }, 0);


  setTimeout(function(){
  $.post(script_root + '/admin/discoveryList/preview', {'solved':solved, 'nonce': $('#nonce').val()})

  $.get(script_root + '/admin/discoveryList/preview', function(data){
        discoveryList = $.parseJSON(JSON.stringify(data));
        solvedList = discoveryList['solved'];
        if(solvedList.length > 0){
            solvedList = solvedList[0].split('&')
        }
        discoveryList = discoveryList['hidden'];
        //console.log(solvedList);
        

        $('.chal-button').each(function(){
            discovery = [];
            chalid = $(this)[0].value
            currentList = 0;

            $('.discovery-'+$(this)[0].value).each(function(i, e){
                //console.log('in disc')
                children = $(e).children('p')
                //console.log($(e).value)
                for (var i = 0; i < children.length; i++) {
                    child = ($('#NeededSet-'+chalid+'-'+currentList+' > span > p'))
                    counter = 0;
                    //console.log('Child: '); console.log(child);
                    for (var n = 0; n < child.length; n++) {
                        //console.log('Child: '); console.log(child); console.log(" n: " + n + "i: " + i + "current: " + currentList);
                        
                        if(solvedList.indexOf(child[n].getAttribute("value")) >= 0){
                            $('#Needed-'+chalid+'-'+currentList+'-'+n).css({"color" : "#affaae"});
                            //console.log($('#Needed-'+chalid+'-'+currentList+'-'+n).text())
                        } else {
                            $('#Needed-'+chalid+'-'+currentList+'-'+n).css({"color" : "#de9191"});
                            counter=-1;
                        }
                    }
                    if(counter == 0){
                        //console.log('challenge: ' + chalid + " has dropdown: " + currentList + " solved, since " + i)
                        $('#NeededSet-'+chalid+'-'+currentList).css({"background" : "#0f960f"});
                    } else {
                        $('#NeededSet-'+chalid+'-'+currentList).css({"background" : "#af3232"});
                    }
                }
                discovery.push($(e).text());
                currentList++;    
            });
            //console.log(discovery)

            color_a=""; color_op="";text_a="";text_op=""
            if(discoveryList.indexOf($(this)[0].value) >= 0){
                $(this).css({"background" : "#de9191"});
                //console.log($(this)[0].value + " has been hidden")
                $(this).mouseleave(function (e) {
                    $(this).css({"background" : "#de9191"});
                });
            } else if(solvedList.indexOf($(this)[0].value) >= 0){
                $(this).css({"color": "black", "background" : "lightblue"});
                //console.log($(this)[0].value + " has been shown")
                $(this).mouseleave(function (e) {
                    $(this).css({"color": "black", "background" : "lightblue"});
                });
            } else{
                $(this).css({"color": "black", "background" : "#affaae"});
                //console.log($(this)[0].value + " has been shown")
                $(this).mouseleave(function (e) {
                    $(this).css({"color": "black", "background" : "#affaae"});
                });
            }
            
            $(this).mouseenter(function (e) {           
                $(this).css({"background" : "lightblue"})
            });
            


        });

        for (var i = 0; i < discoveryList.length; i++) {
            discovery = "<span class='label label-primary chal-discovery'><span>"+discoveryList[i].discovery+"</span><a name='"+discoveryList[i].id+"'' class='delete-discovery'>&#215;</a></span>";
            $('#current-discoveryList').append(discovery);
        };


    });
    }, 100);
  
}

function scrolling(id){
  if(id==0){
      setTimeout(function(){ scrollIntoViewIfNeeded($(".preview0")[0]); }, 0);
  } else{
      setTimeout(function(){ scrollIntoViewIfNeeded(document.getElementById("disc-drop-"+id));window.scrollBy(0, 200); }, 0);
  }
}

function scrollIntoViewIfNeeded(target) {
    var rect = target.getBoundingClientRect();
    if (rect.bottom > window.innerHeight) {
        target.scrollIntoView(false);
    }
    if (rect.top < 0) {
        target.scrollIntoView();
    } 
}


//Reference: https://www.w3resource.com/javascript-exercises/searching-and-sorting-algorithm/searching-and-sorting-algorithm-exercise-1.php
function quicksort(chals){
    if(chals.length >= 1){
        var left = []
        var right = []
        var ordered = []
        var pivot = chals.pop()
    loadALLdiscoveryList();
    loadStatus();

        for(var i=0; i < chals.length; i++){
            if(chals[i].value >= pivot.value){
                left.push(chals[i])
            } else {
                right.push(chals[i])
            }
        }
        return ordered.concat(quicksort(left), pivot, quicksort(right));
    }
    return chals
}


function loaddiscoveryList(chal){
    $('#current-discoveryList').empty();
    $('#chal-discoveryList').empty();
    $.get(script_root + '/admin/discoveryList/' + chal, function(data){
        discoveryList = $.parseJSON(JSON.stringify(data));
        discoveryList = discoveryList['discoveryList'];
        for (var i = 0; i < discoveryList.length; i++) {
            discovery = "<span class='label label-primary chal-discovery'><span>"+discoveryList[i].discovery+"</span><a name='"+discoveryList[i].id+"'' class='delete-discovery'>&#215;</a></span>";
            $('#current-discoveryList').append(discovery);
        };
        $('.delete-discovery').click(function(e){
            deletediscovery(e.target.name);
            $(e.target).parent().remove();
        });
    });
}

function deleteAll(){
    $.post(script_root + '/admin/discoveryList/delete', {'service':['delete'], 'nonce': $('#nonce').val(), 'id':"0"})
    loadchals2();
    loadALLdiscoveryList();
    loadStatus();
}

function updateStatus(){
    loadStatus()
    service = [];
    
    if (document.getElementById("check").checked){
        status = "ON";
        
    } else{
        status = "OFF";
    }

    service.push(status)

    $.post(script_root + '/admin/discoveryList/0', {'service':service, 'nonce': $('#nonce').val(), 'id':"0"})
    loadStatus();
}

function loadStatus(){
    $.get(script_root + '/admin/discoveryList/0', function(data){
        var status =[];
        status = $.parseJSON(JSON.stringify(data));
        status = status['service'][0]

        if (status == ""){
            status = "ON";
        }
        if (status == "ON"){
            document.getElementById("check").checked = true;
        } else {
            document.getElementById("check").checked = false;
        }

        return status;
    });
        
}

function updateAuto(){
    loadAuto()
    auto = [];
    
    if (document.getElementById("auto").checked){
        status = "autoON";

        $.get(script_root + '/admin/discoveryList/' + 'auto', function(data){
            var status =[];
            status = $.parseJSON(JSON.stringify(data));
            Challenges = status['Challenge'];
            Discovery = status['Dependent Challenges'];


            for (var i=0; i < Challenges.length; i++){ 
                discoveryList=[]
                for (var x=0; x< Discovery[Challenges[i]].length; x++){
                    var cur = Discovery[Challenges[i]][x]
                    
                    if (cur.length > 1){
                        cur = cur.filter(function(n){ return n != undefined && n != ''})
                        cur = cur.join('&')
                    } else if(cur.length == 0){
                        cur = []
                    }

                    discoveryList.push(Discovery[Challenges[i]][x])
                }
                

                $.post(script_root + '/admin/discoveryList/'+Challenges[i], {'discoveryList':discoveryList, 'nonce': $('#nonce').val()})
            }
               
        });
        loadchals2();
        loadStatus();

    } else{
        status = "autoOFF";
    }

    auto.push(status)

    $.post(script_root + '/admin/discoveryList/0', {'auto':auto, 'nonce': $('#nonce').val(), 'id':"0"})
    loadAuto()
    loadStatus()
}

function updateAuto2(){
    //loadAuto()
    auto = [];

    status = "autoON";

    $.get(script_root + '/admin/discoveryList/' + 'auto', function(data){
        var status =[];
        status = $.parseJSON(JSON.stringify(data));
        Challenges = status['Challenge'];
        Discovery = status['Dependent Challenges'];

        for (var i=0; i < Challenges.length; i++){ 
            discoveryList=[]
            for (var x=0; x< Discovery[Challenges[i]].length; x++){
                var cur = Discovery[Challenges[i]][x]
                    
                if (cur.length > 1){
                    cur = cur.filter(function(n){ return n != undefined && n != ''})
                    cur = cur.join('&')
                } else if(cur.length == 0){
                    cur = []
                }

                discoveryList.push(Discovery[Challenges[i]][x])
            }
              

            $.post(script_root + '/admin/discoveryList/'+Challenges[i], {'discoveryList':discoveryList, 'nonce': $('#nonce').val()})
        }
               
    });
    loadchals2();
    loadStatus();

    auto.push(status)

    $.post(script_root + '/admin/discoveryList/0', {'auto':auto, 'nonce': $('#nonce').val(), 'id':"0"})
    //loadAuto()
    loadStatus()
}


function loadAuto(){
    $.get(script_root + '/admin/discoveryList/0', function(data){
        var status =[];
        status = $.parseJSON(JSON.stringify(data));
        status = status['auto'][0]

        if (status == ""){
            status = "autoOFF";
        }
        if (status == "autoON"){
            document.getElementById("auto").checked = true;
        } else {
            document.getElementById("auto").checked = false;
        }

        return status;
    });
        
}

function updatediscoveryList(chal){
    discoveryList = [];

    $('#chal-discoveryList-'+chal+' > span').each(function(i, e){
	discoveryList.push($(e).text());
    });

    $.post(script_root + '/admin/discoveryList/'+chal, {'discoveryList':discoveryList, 'nonce': $('#nonce').val()})
    $.post(script_root + '/admin/discoveryList/0', {'auto':["autoOFF"], 'nonce': $('#nonce').val()})
    loaddiscoveryList(chal);
    loadchals2();
}

function loadALLdiscoveryList(){

    discoveryList = [];

    $('.chal-button').each(function(){
            var chal = $(this).val();

	    $('#current-discoveryList-'+chal).empty();
	    $('#chal-discoveryList-'+chal).empty();
	    $.get(script_root + '/admin/discoveryList/' + chal, function(data){
		discoveryList = $.parseJSON(JSON.stringify(data));
		discoveryList = discoveryList['discoveryList'];
		for (var i = 0; i < discoveryList.length; i++) {
		    discovery = "<span class='label label-primary chal-discovery'><span>"+discoveryList[i].discovery+"</span><a name='"+discoveryList[i].id+"'' class='delete-discovery'>&#215;</a></span>";
		    $('#current-discoveryList-'+chal).append(discovery);
		};
		$('.delete-discovery').click(function(e){
		    deletediscovery(e.target.name);
		    $(e.target).parent().remove();
		});
	    });
    });
}


function deletediscovery(discoveryid){
    $.post(script_root + '/admin/discoveryList/' + discoveryid+'/delete', {'nonce': $('#nonce').val()});
    $(this).parent().remove();
}


function builddiscovery(chal, id, challenges){
    var elem = $('<div class="col-md-12 row current-discovery">');
    
    var dropdown = $('<div class="btn-group dropdown" role="group">');
    dropdown.append('<button class="btn btn-default dropdown-toggle disc-drop" type="button" id="discovery_dropdown-' + id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" value="'+id+'"><span class="chal-quantity">0</span> Challenges<span class="chal-plural">s</span> <span class="caret"></span></button>');

    var options = $('<ul class="dropdown-menu" aria-labelledby="discovery_dropdown">');
    dropdown.append(options);
    var buttons = $('<div class="btn-group disc-drop" role="group">');
    buttons.append(dropdown);

    
    for (var s = 0; s <= challenges.length - 1; s++) { //ordered by points and seperated into categories
        if(chal != challenges[s].name){
            add_discovery = $('<li class="discovery-item drop-'+ id +'" value="'+id+'" id="'+challenges[s].id+'" onclick="setTimeout(scrolling('+id+'), 0);"><a href="#"><span class="fa fa-square-o" aria-hidden="true"></span><span class="fa fa-check-square-o" aria-hidden="true"></span> '+'Category: '+challenges[s].category+' | Name: '+challenges[s].name+' | Points: '+challenges[s].value+'</a></li>');
            
            add_discovery.click(function(e){
                if($(this).hasClass('active')){
                    $(this).removeClass('active');
                    $(this).find('.fa-check-square-o').hide();
                    $(this).find('.fa-square-o').show();
                }
                else{
                    $(this).addClass('active');
                    $(this).find('.fa-check-square-o').show();
                    $(this).find('.fa-square-o').hide();
                }
                var numActive = $(this).parent().find(".active").length;
                
                discElem=[];
                discovery=[];
                for(var i = 0; i < numActive; ++ i){
                    var optionText = $(this).parent().find(".active")[i].id;
                    if(discElem.indexOf(optionText) == -1){
                        discElem.push(optionText);
                    }
                }

                if($(this).parent().find(".active").length == 0){
                   $('#chal-discoveryList-'+id).empty();
                }

                $(discElem).each(function(){
                    discovery.push(parseInt(this))
                });
                discovery=discovery.join('&');
                
                if (discovery.length > 0){
                    if($(String('.disc'+chal)).length == 0){
                        discovery = "<span class='label label-primary chal-discovery disc"+chal+"'><span>"+discovery  ;                 
                        $('#chal-discoveryList-'+$(this).val()).append(discovery);
                    } else{
                        $(String('.disc'+chal))[0].innerText=discovery;
                    }
                    $('.discovery-insert').val("");
                }
              
                $(this).parent().parent().find(".chal-quantity").text(numActive.toString());
                if(numActive == 1){
                    $(this).parent().parent().find(".chal-plural").html("&nbsp;");
                }
                else {
                    $(this).parent().parent().find(".chal-plural").html("s");
                }

                e.stopPropagation();
            })
            add_discovery.find('.fa-check-square-o').hide();
            add_discovery.append($("<input class='chal-link' type='hidden'>").val(id));
            options.append(add_discovery);
        }

    }
    
    if(options.children().length == 0){
      options.append('<li>&nbsp; No other Problems</li>');
    }

    //buttons.append('<a href="#" onclick="$(this).parent().parent().remove(); $(String(\'.disc'+String(chal)+'\')).remove()" style="margin-right:-10px;" class="btn btn-danger pull-right discovery-remove-button">Remove</a></td></tr>');
    elem.append(buttons);
        
    return elem;
}
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


