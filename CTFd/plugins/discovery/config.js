//         Heavily Modified CTFd/themes/admin/static/js/chalboard.js Functions
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function loadchals2(){
    $('#challenges2').empty();
    $('#challenges2').append($('<button class="OFF form-group btn btn-theme btn-outlined" id="submit-status" onclick="updateStatus()" type="submit" title="(Currently ON)" style="background-color: #ed8989;><p size="-8">Turn OFF</p></button><button class="ON form-group btn btn-theme btn-outlined" id="submit-status" onclick="updateStatus()" type="submit" title="(Currently OFF)" style="background-color: #89ed89;><p size="-8">Turn ON </p></button></span><br><br>'));
    $('#challenges2').append($('<button class="form-group btn btn-theme btn-outlined" id="submit-discoveryList2" onclick="updateALLdiscoveryList()" type="submit">Update All</button><br><br>'));
    $.post(script_root + "/admin/chals", {
        'nonce': $('#nonce').val()
    }, function (data) {
        categories = [];
        challenges = $.parseJSON(JSON.stringify(data));
        chalList = [];

        for (var i = challenges['game'].length - 1; i >= 0; i--) {
            if ($.inArray(challenges['game'][i].category, categories) == -1) {
                $('#challenges2').append($('<tr id="' + challenges['game'][i].category + '"><td class="col-md-1"><h2>' + challenges['game'][i].category + '</h2></td></tr>'))
                categories.push(challenges['game'][i].category)

                for (var k = challenges['game'].length - 1; k >= 0; k--) {
                    if (challenges['game'][k].category == challenges['game'][i].category) {
                        console.log("Challenge: " + challenges['game'][k].name + " was found to be in: " + challenges['game'][k].category);
                        
                       var chalDisc = '<table class="discovery" id="discovery-{0}" value="{1}" cellspacing="0" cellpadding="0" style="display: inline-block;"></table></br></br></br></br>'.format(challenges['game'][k].id, challenges['game'][k].name);
                       $('#challenges2').append($(chalDisc));

                       $('#discovery-'+challenges['game'][k].id).append('<tr id="disc-drop-'+challenges['game'][k].id+'"><td><button class="chal-button col-md-2" style="background:grey;" value="{0}"><h5>{1}</h5><p>{2}</p><h3 style="display:none;padding-top:12px;padding-bottom:12px;margin-top:5px;">UPDATE</h3></button></td><td><div id="current-discoveryList-{0}" style="display: none;"></div><div id="chal-discoveryList-{0}" style="display: none;"></div>'.format(challenges['game'][k].id, challenges['game'][k].name, challenges['game'][k].value));
                      
                       $('#disc-drop-'+challenges['game'][k].id).append(builddiscovery(challenges['game'][k].name, challenges['game'][k].id, challenges));

                       $('#disc-drop-'+challenges['game'][k].id).append($('</td></tr>'));
                    }
                }

            }
            chalList.push([challenges['game'][i].id,challenges['game'][i].name])
        };
        
        

        for (var i = 0; i <= challenges['game'].length - 1; i++) {
            var chal = challenges['game'][i];
   
            $.get(script_root + '/admin/discoveryList/' + chal.id, function(data){
                discoveryList = $.parseJSON(JSON.stringify(data));
                discoveryList = discoveryList['discoveryList'];
                console.log(discoveryList);
                for (var j = 0; j < discoveryList.length; j++) { //For each ANDed set
                    andSet = []
                    list = discoveryList[j].discovery.split("&");
                    console.log(list);
                    for (var k=0; k < list.length; k++){
                        for (var l=0; l<chalList.length; l++){
                            if(chalList[l][0]==list[k]){
                                andSet.push(chalList[l][1]);
                            }
                        }
                    }
                
 
                    discovery = "<td style='background-color: #4bcdcd; border: 1px solid #dddddd;'><span class='chal-discovery discovery-"+ (discoveryList[j].chal) + "' value='"+ discoveryList[j].chal +"'>"
                   
                    for (var k=0; k < andSet.length; k++){
                        discovery += "<p style='color:red;'>"+andSet[k]+"</p>"
                    }

                    discovery += "</span><a name='"+discoveryList[j].id+"'' class='delete-discovery' id='"+ discoveryList[j].chal +"'>&#215;</a></span></td>";
                    $('#discovery-'+discoveryList[j].chal).append(discovery);
                }
                $('.delete-discovery').click(function(e){
            	    deletediscovery(e.target.name);
                    $(e.target).parent().remove();
                    loaddiscoveryList(e.target.id);
        	});
            });
            
        };

        $('.chal-button').click(function (e) {
            id = this.value
            updatediscoveryList2(id);
            loadStatus();
            

            //UNCOMMENT BELOW FOR DEBUGGING
            //load_chal_template(id, function(){
            //    openchal(id);
            //});
        });


        $('.chal-button').mouseenter(function (e) {
            id = this.value
            
            console.log("Hovered over:" + id)
            //console.log($("#disc-drop-"+id+" p"))
            $(this).css({"color": "white" , "background" : "red"})
            $("#disc-drop-"+id+" p").hide()
            $("#disc-drop-"+id+" h5").hide()
            $("#disc-drop-"+id+" h3").show()
        });
        $('.chal-button').mouseleave(function (e) {
            id = this.value
            
            console.log($(this))
            //this.innerHTML=this.store;
            $(this).css({"color" : "white", "background" : "grey"});
            $("#disc-drop-"+id+" p").show()
            $("#disc-drop-"+id+" h5").show()
            $("#disc-drop-"+id+" h3").hide()
        });

    });
}


$(function(){
    loadchals2();
    loadALLdiscoveryList();
    loadStatus();
})

//         Challenge Discovery JS
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-




function loaddiscoveryList1(){
    var chal = $('.chal-id').val();

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

function updatediscoveryList(){
    discoveryList = [];
    chal = $('.chal-id').val();
    //console.log($('.chal-id').val());
    //console.log($('#chal-discoveryList > span'));http://ctf/admin/discoveryList/0
    //console.log($('#chal-discoveryList'));
    $('#chal-discoveryList > span').each(function(i, e){
        discoveryList.push($(e).text());
    });
    $.post(script_root + '/admin/discoveryList/'+chal, {'discoveryList':discoveryList, 'nonce': $('#nonce').val()})
    loaddiscoveryList(chal);
}

function updateStatus(){
    loadStatus()
    discoveryList = [];
    
    if ($(".OFF").css('display') == 'none'){
        status = "OFF"
        console.log("Service is off")
    } else{
        status = "ON"
        console.log("Service is on")

    }


    if (status=="OFF"){
        status = "ON";

    } else {
        status = "OFF";

    }

    discoveryList.push(status)


    $.post(script_root + '/admin/discoveryList/0', {'discoveryList':discoveryList, 'nonce': $('#nonce').val(), 'id':"0"})
    loadStatus()
}

function loadStatus(){
    

    $.get(script_root + '/admin/discoveryList/0', function(data){
        var status =[];
        status = $.parseJSON(JSON.stringify(data));
        status = status['service'][0]
        console.log(status)

        if (status == ""){
            status = "ON";
        }
        if (status == "ON"){
            status = "OFF";
            $(".OFF").show()
            $(".ON").hide()
        } else {
            status = "ON";
            $(".OFF").hide()
            $(".ON").show()
        }

        return status;
    });
    

    
}


function updateALLdiscoveryList(){
    discoveryList = [];

    console.log("Beginning to update stuff");

    $('.chal-button').each(function(){
            discoveryList = [];
	    chal = $(this).val();

	    $('#chal-discoveryList-'+chal+' > span').each(function(i, e){
		discoveryList.push($(e).text());
	    });

	    $.post(script_root + '/admin/discoveryList/'+chal, {'discoveryList':discoveryList, 'nonce': $('#nonce').val()})
	    loaddiscoveryList(chal);
    });
    loadchals2();
}

function updatediscoveryList2(chal){
    discoveryList = [];

    console.log("Beginning to update stuff");

    discoveryList = [];

    $('#chal-discoveryList-'+chal+' > span').each(function(i, e){
	discoveryList.push($(e).text());
    });

    console.log($('#chal-discoveryList-'+chal+' > span'))

    $.post(script_root + '/admin/discoveryList/'+chal, {'discoveryList':discoveryList, 'nonce': $('#nonce').val()})
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

$('#create-discovery').click(function(e){
    elem = builddiscovery1();
    $('#current-discoveryList').append(elem);
});

var discovery_dropdown=-1

function builddiscovery1(){
    var discoveryList = [];
    
    $('.chal-title').each(function(){
        curChalNum = this.innerText;
    });
    
    var elem = $('<div class="col-md-12 row current-discovery">');
    discovery_dropdown += 1;
    var this_disc_drop_id = discovery_dropdown;
    
    var buttons = $('<div class="btn-group disc-drop" role="group">');
    var dropdown = $('<div class="btn-group dropdown" role="group">');
    dropdown.append('<button class="btn btn-default dropdown-toggle" type="button" id="discovery_dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><span class="chal-quantity">0</span> Challenges<span class="chal-plural">s</span> <span class="caret"></span></button>');
    var options = $('<ul class="dropdown-menu" aria-labelledby="discovery_dropdown">');
    dropdown.append(options);
    buttons.append(dropdown);
    
    $('.chal-button').each(function(){
        if(this.firstChild.innerText != curChalNum){
            add_discovery = $('<li class="discovery-item"><a href="#"><span class="fa fa-square-o" aria-hidden="true"></span><span class="fa fa-check-square-o" aria-hidden="true"></span> '+'ID: '+$(this).val()+'| name: '+this.firstChild.innerText+'</a></li>');
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
                    var optionText = $(this).parent().find(".active")[i].innerText;
                    if(discElem.indexOf(optionText) == -1){
                        discElem.push(optionText);
                    }
                }
                $(discElem).each(function(){
                    discovery.push(parseInt(String(this.match(/(ID:\ )\d+/g)).replace(/(ID:\ )/g, '')));
                });loadALLdiscoveryList()
                discovery=discovery.join('&');
                
                if (discovery.length > 0){
                    if($(String('.disc'+this_disc_drop_id)).length == 0){
                        discovery = "<span class='label label-primary chal-discovery disc"+this_disc_drop_id+"'><span>"+discovery  ;                 
                        $('#chal-discoveryList').append(discovery);
                        // $('#chal-discoveryList')[this_disc_drop_id] = discovery;
                    } else{
                        $(String('.disc'+this_disc_drop_id))[0].innerText=discovery;
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
            var chalid = parseInt($(this).find('.chal-button').value);
            add_discovery.append($("<input class='chal-link' type='hidden'>").val(chalid));
            options.append(add_discovery);

            if($.inArray(chalid, discoveryList) > -1){
                add_discovery.click();
            }
        }
    });
    
    if(options.children().length == 0){
      options.append('<li>&nbsp; No other Problems</li>');
    }

    buttons.append('<a href="#" onclick="$(this).parent().parent().remove(); $(String(\'.disc'+String(this_disc_drop_id)+'\')).remove()" style="margin-right:-10px;" class="btn btn-danger pull-right discovery-remove-button">Remove</a>');
    elem.append(buttons);
        
    return elem;
}

function builddiscovery(chal, id, challenges){
    //var discoveryList = []

    
    var elem = $('<div class="col-md-12 row current-discovery">');
    
    var dropdown = $('<div class="btn-group dropdown" role="group">');
    dropdown.append('<button class="btn btn-default dropdown-toggle disc-drop" type="button" id="discovery_dropdown-' + id + '" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" value="'+id+'"><span class="chal-quantity">0</span> Challenges<span class="chal-plural">s</span> <span class="caret"></span></button>');

    var options = $('<ul class="dropdown-menu" aria-labelledby="discovery_dropdown">');
    dropdown.append(options);
    var buttons = $('<div class="btn-group disc-drop" role="group">');
    buttons.append(dropdown);
    
    for (var s = 0; s <= challenges['game'].length - 1; s++) { //Ording by ID, not category
        if(chal != challenges['game'][s].name){
            add_discovery = $('<li class="discovery-item" value="'+id+'"><a href="#"><span class="fa fa-square-o" aria-hidden="true"></span><span class="fa fa-check-square-o" aria-hidden="true"></span> '+'ID: '+challenges['game'][s].id+'| name: '+challenges['game'][s].name+'</a></li>');
            
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
                    var optionText = $(this).parent().find(".active")[i].innerText;
                    if(discElem.indexOf(optionText) == -1){
                        discElem.push(optionText);
                    }
                }

                if($(this).parent().find(".active").length == 0){
                   $('#chal-discoveryList-'+id).empty();
                }

                $(discElem).each(function(){
                    discovery.push(parseInt(String(this.match(/(ID:\ )\d+/g)).replace(/(ID:\ )/g, '')));
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
            var chalid = parseInt($(this).find('.chal-button').value);
            add_discovery.append($("<input class='chal-link' type='hidden'>").val(chalid));
            options.append(add_discovery);

            //if($.inArray(chalid, discoveryList) > -1){
             //   add_discovery.click();
            //}
        }

    }
    
    
    if(options.children().length == 0){
      options.append('<li>&nbsp; No other Problems</li>');
    }

    //buttons.append('<a href="#" onclick="$(this).parent().parent().remove(); $(String(\'.disc'+String(chal)+'\')).remove()" style="margin-right:-10px;" class="btn btn-danger pull-right discovery-remove-button">Remove</a></td></tr>');
    elem.append(buttons);
        
    return elem;
}


$('#submit-discoveryList').click(function (e) {
    e.preventDefault();
    updatediscoveryList();
    updateALLdiscoveryList();
    loadchals2();
});

$('.submit-discoveryList2').click(function (e) {
    e.preventDefault();
    updateALLdiscoveryList();
    loadchals2();
});




// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


