var ojRet, ngio;

function ngCreateCore( appId ) {
    ngio = new Newgrounds.io.core( appId );
    ngio.getValidSession(function(){});
}   

function handleResponse(output) {
      ojRet = output;
}

function ngPostScore( sbId, vParam) {
    var input = {
    	app_id: ngio.app_id,
    	session_id: ngio.session_id, 
    	call: {
    		component: "ScoreBoard.postScore",
                
                parameters: {
                     id: sbId,
                     value: vParam
                 }
    	}
    };

    $.post(
        "//www.newgrounds.io/gateway_v3.php",
        {input:JSON.stringify(input)}
    );
}

function ngGetScores( sbId ) {
    var input = {
    	app_id: ngio.app_id, 
    	session_id: ngio.session_id,
    	call: {
    		component: "ScoreBoard.getScores",
                      parameters: {
                             id: sbId,
	        period: 'A'
                        }
    	}
    };

    
    $.post(
        "//www.newgrounds.io/gateway_v3.php",
        {input:JSON.stringify(input)}, 
        handleResponse
    );
}


function ngPlaceScoreboardName( pos ) {
        return ojRet.result.data.scores[pos].user.name;
}

function ngPlaceScoreboardValue( pos ) {
        return ojRet.result.data.scores[pos].value;
}

function ngGetName( ) {
        if(ngio.user)
	return ngio.user.name;
        else
                     return "Guest";
}

function ngUnlockMedal( mId ) {
    var input = {
    	app_id: ngio.app_id,
    	session_id: ngio.session_id, 
    	call: {
    	        component: "Medal.unlock",
                
                          parameters: {
                                  id: mId
                            } 
    	}
    };

    $.post(
        "//www.newgrounds.io/gateway_v3.php",
        {input:JSON.stringify(input)}
    );
}




function ngDeleteCore( appId ) {
    delete ngio;
}   
