//ripped from mosquitto source
function matches_sub(sub, topic) {
  var slen, tlen;
	var spos, tpos;
	var multilevel_wildcard = false;


	slen = sub.length;
	tlen = topic.length;

	if(slen && tlen){
		if((sub[0] == '$' && topic[0] != '$') || (topic[0] == '$' && sub[0] != '$')){
			return false;
		}
	}

	spos = 0;
	tpos = 0;

	while(spos < slen && tpos < tlen){
		if(sub[spos] == topic[tpos]){
			if(tpos == tlen-1){
				/* Check for e.g. foo matching foo/# */
				if(spos == slen-3 
						&& sub[spos+1] == '/'
						&& sub[spos+2] == '#'){
					multilevel_wildcard = true;
					return true;
				}
			}
			spos++;
			tpos++;
			if(spos == slen && tpos == tlen){
				return true;
			}else if(tpos == tlen && spos == slen-1 && sub[spos] == '+'){
				spos++;
				return true;
			}
		}else{
			if(sub[spos] == '+'){
				spos++;
				while(tpos < tlen && topic[tpos] != '/'){
					tpos++;
				}
				if(tpos == tlen && spos == slen){
					return true;
				}
			}else if(sub[spos] == '#'){
				multilevel_wildcard = true;
				if(spos+1 != slen){
					return false;
				}else{
					return true;
				}
			} else {
				return false;
			}
		}
	}
	if(multilevel_wildcard == false && (tpos < tlen || spos < slen)){
		return false;
	}

}
