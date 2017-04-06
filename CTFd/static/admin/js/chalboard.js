function loaddiscoveryList(chal){
    $('#discoveryList-chal').val(chal)
    $('#current-discoveryList').empty()
    $('#chal-discoveryList').empty()
    $.get(script_root + '/admin/discoveryList/'+chal, function(data){
        discoveryList = $.parseJSON(JSON.stringify(data))
        discoveryList = discoveryList['discoveryList']
        for (var i = 0; i < discoveryList.length; i++) {
            discovery = "<span class='label label-primary chal-discovery'><span>"+discoveryList[i].discovery+"</span><a name='"+discoveryList[i].id+"'' class='delete-discovery'>&#215;</a></span>"
            $('#current-discoveryList').append(discovery)
        };
        $('.delete-discovery').click(function(e){
            deletediscovery(e.target.name)
            $(e.target).parent().remove()
        });
    });
}

function updatediscoveryList(){
    discoveryList = [];
    chal = $('#discoveryList-chal').val()
    console.log("Done!")
    console.log($('#chal-discoveryList > span'))
    console.log($('#chal-discoveryList'))
    $('#chal-discoveryList > span').each(function(i, e){
        discoveryList.push($(e).text())
    });
    $.post(script_root + '/admin/discoveryList/'+chal, {'discoveryList':discoveryList, 'nonce': $('#nonce').val()})
    loadchal(chal)
}

function deletediscovery(discoveryid){
    $.post(script_root + '/admin/discoveryList/'+discoveryid+'/delete', {'nonce': $('#nonce').val()});
    $(this).parent().remove()
}

$('#create-discovery').click(function(e){
    elem = builddiscovery();
    $('#current-discoveryList').append(elem);
});

var discovery_dropdown=-1

function builddiscovery(){
    var discoveryList = []
    
    $('.chal-title').each(function(){
        curChalNum = this.innerText
    });
    
    var elem = $('<div class="col-md-12 row current-discovery">');
    discovery_dropdown += 1
    var this_disc_drop_id = discovery_dropdown
    
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
                
                discElem=[]
                discovery=[];
                for(var i = 0; i < numActive; ++ i){
                    var optionText = $(this).parent().find(".active")[i].innerText;
                    if(discElem.indexOf(optionText) == -1){
                        discElem.push(optionText);
                    }
                }
                $(discElem).each(function(){
                    discovery.push(parseInt(String(this.match(/(ID:\ )\d+/g)).replace(/(ID:\ )/g, '')))
                });
                discovery=discovery.join('&')
                
                if (discovery.length > 0){
                    if($(String('.disc'+this_disc_drop_id)).length == 0){
                        discovery = "<span class='label label-primary chal-discovery disc"+this_disc_drop_id+"'><span>"+discovery                   
                        $('#chal-discoveryList').append(discovery)
                        // $('#chal-discoveryList')[this_disc_drop_id] = discovery
                    } else{
                        $(String('.disc'+this_disc_drop_id))[0].innerText=discovery
                    }
                    $('.discovery-insert').val("")
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

function loadchals(){
    $('#challenges').empty();
    $.post(script_root + "/admin/chals", {
        'nonce': $('#nonce').val()
    }, function (data) {
        categories = [];
        challenges = $.parseJSON(JSON.stringify(data));


        for (var i = challenges['game'].length - 1; i >= 0; i--) {
            if ($.inArray(challenges['game'][i].category, categories) == -1) {
                categories.push(challenges['game'][i].category)
                $('#challenges').append($('<tr id="' + challenges['game'][i].category.replace(/ /g,"-").hashCode() + '"><td class="col-md-1"><h3>' + challenges['game'][i].category + '</h3></td></tr>'))
            }
        };

        for (var i = 0; i <= challenges['game'].length - 1; i++) {
            var chal = challenges['game'][i]
            var chal_button = $('<button class="chal-button col-md-2 theme-background" value="{0}"><h5>{1}</h5><p class="chal-points">{2}</p><span class="chal-percent">{3}% solved</span></button>'.format(chal.id, chal.name, chal.value, Math.round(chal.percentage_solved * 100)));
            $('#' + challenges['game'][i].category.replace(/ /g,"-").hashCode()).append(chal_button);
        };

        $('#challenges button').click(function (e) {
            loadchal(this.value);
            loadkeys(this.value);
            loadtags(this.value);
            loadfiles(this.value);
            loaddiscoveryList(this.value);
        });
    });
}

$('#submit-discoveryList').click(function (e) {
    e.preventDefault();
    updatediscoveryList()
});