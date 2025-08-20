window.onload = init;

function init() {
   document.forms[0].onsubmit = function() {
      if (this.checkValidity()) alert("You Are Succesfully To Send");
      return false;
   }
   
   document.getElementById("name").onclick = turnOnName;
   document.getElementById("email").onclick=turnOnEmail;
   document.getElementById("phone no").onclick=turnOnPhoneno;
}

function turnOnEmail() {
   document.getElementById("nameBox").disabled=false;
   document.getElementById("telBox").disabled=false;
   document.getElementById("emailBox").disabled=true;
}

function turnOnName() {
   document.getElementById("telBox").disabled=false;
   document.getElementById("emailBox").disabled=false;
   document.getElementById("nameBox").disabled=true;
}

function turnOnPhoneno() {
   document.getElementById("nameBox").disabled=false;
   document.getElementById("emailBox").disabled=false;
   document.getElementById("telBox").disabled=true;
}



   