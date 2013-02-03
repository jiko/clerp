var clerp = new Firebase('https://jiko.firebaseio.com/');
var people = clerp.child("people");
var uid;
var presenceRef;

var authClient = new FirebaseAuthClient(clerp, function(error, user) {
    if (error) {
        console.log(error);
    } else if (user) {
      uid = user.id;
      var userRef = people.child(user.id);
      userRef.once('value', function(snapshot) {
        if (snapshot.val() === null) {
          userRef.set({data: user, loggedIn: true});
        } else {
          userRef.update({data: user, loggedIn: true});
        }
      });
      presenceRef = userRef.child('online');
      // Make sure if I lose my connection I am marked as offline.
      presenceRef.onDisconnect().set(false);
      // Now, mark myself as online.
      presenceRef.set(true);
    } else {
      console.log("not logged in");
    }
});

people.on('child_added', function(snapshot) {
  if (snapshot.val().loggedIn === true) {
    showUser(snapshot.val());
  }
});

people.on('child_changed', function(snapshot) {
  if (snapshot.val().loggedIn === true) {
    showUser(snapshot.val());
  } else {
    removeUser(snapshot.val().data.id);
  }
});

var signin = document.getElementById("signin");
signin.addEventListener("click", function() {
  authClient.login('facebook', {rememberMe: true});
});

var signout = document.getElementById("signout");
signout.addEventListener("click", function() {
    people.child(uid).update({loggedIn:false});
    authClient.logout();
});

var showUser = function (user) {
  if (document.getElementById(user.data.id) === null) {
    var clerps = document.getElementById('clerps');
    var li = document.createElement("li");
    li.setAttribute('id',user.data.id);
    var a = document.createElement("a")
    a.setAttribute('href',user.data.link);
    var img = document.createElement("img");
    img.src="https://graph.facebook.com/" + user.data.id + "/picture/?type=large&return_ssl_resources=1";
    img.setAttribute("title",user.data.name);
    clerps.appendChild(li);
    li.appendChild(a);
    a.appendChild(img);
  }
  if (user.online === false) {
    var clerper = document.getElementById(uid);
    var anchor = clerper.firstElementChild;
    var img = anchor.firstElementChild;
    img.classList.add('clerped');
  }
}

var removeUser = function (id) {
  var user = document.getElementById(id);
  user.parentNode.removeChild(user);
}
