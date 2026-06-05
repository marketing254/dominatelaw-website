// Dominate Law — Form Security Utility
// Guards all forms against bots, spam, and repeated submissions.
'use strict';
(function(w){
  /* Shannon entropy — measures randomness of a string (higher = more random) */
  function entropy(s){
    if(!s||s.length<2)return 0;
    var f={},l=s.length,e=0;
    for(var i=0;i<l;i++)f[s[i]]=(f[s[i]]||0)+1;
    for(var c in f){var p=f[c]/l;e-=p*Math.log2(p);}
    return e;
  }

  /* Detect junk / random character strings */
  function isJunk(s){
    if(!s)return false;
    s=String(s).trim();
    if(s.length<8)return false;
    var noSpace=s.indexOf(' ')===-1;
    var mixed=/[A-Z]/.test(s)&&/[a-z]/.test(s);
    var allUp=s===s.toUpperCase()&&/[A-Z]{3}/.test(s);
    // High-entropy + no spaces = random chars (e.g. "caDKJdqnkgpml")
    if(entropy(s)>3.4&&noSpace&&s.length>10)return true;
    // Mixed-case no spaces (camelCase random strings)
    if(mixed&&noSpace&&s.length>8)return true;
    // ALL-CAPS no spaces
    if(allUp&&noSpace&&s.length>8)return true;
    return false;
  }

  /* Phone must contain only digits, spaces, dashes, parens, plus, dots */
  function validPhone(s){
    if(!s)return true; // optional field — pass through
    return /^[\d\s\-\+\(\)\.]{6,20}$/.test(String(s).trim());
  }

  /* Rate limiting — one submission per form key per 24 hours */
  function canSubmit(key){
    try{
      var t=localStorage.getItem('dl_sub_'+key);
      if(t&&Date.now()-parseInt(t)<86400000)return false;
    }catch(e){}
    return true;
  }
  function markDone(key){
    try{localStorage.setItem('dl_sub_'+key,String(Date.now()));}catch(e){}
  }

  /* Time check — form must be open at least 3 seconds before submission */
  function tooFast(ts){return Date.now()-(ts||w.DLSec.t0)<3000;}

  /* Honeypot — hidden field must remain empty; bots fill it automatically.
     Defensive: .dl-hp can match wrapper divs that have no .value property,
     so we check every honeypot candidate and skip anything without a string .value. */
  function hpFilled(form){
    if(!form)return false;
    var els=form.querySelectorAll('.dl-hp, input[name="dl_hp"], input[name="website_url"]');
    for(var i=0;i<els.length;i++){
      var v=els[i].value;
      if(typeof v==='string'&&v.length>0)return true;
    }
    return false;
  }

  w.DLSec={
    isJunk:isJunk,
    validPhone:validPhone,
    canSubmit:canSubmit,
    markDone:markDone,
    tooFast:tooFast,
    hpFilled:hpFilled,
    t0:Date.now() // page-load timestamp for speed check
  };
})(window);
