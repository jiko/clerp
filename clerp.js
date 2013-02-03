var clerp = new Firebase('https://jiko.firebaseio.com/');
var people = clerp.child("people");
var uid;

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
    } else {
      console.log("not logged in");
    }
});

presenceRef.on('value', function(snapshot) {
  if (snapshot.val() === false) {
    var clerper = document.getElementById(uid);
    var anchor = clerper.firstElementChild;
    var img = anchor.firstElementChild;
    img.classList.add('clerped');
  } else {
    var clerper = document.getElementById(uid);
    var anchor = clerper.firstElementChild;
    var img = anchor.firstElementChild;
    img.classList.remove('clerped');
  }
});

people.on('child_added', function(snapshot) {
  if (snapshot.val().loggedIn === true) {
    showUser(snapshot.val().data);
  }
});

people.on('child_changed', function(snapshot) {
  if (snapshot.val().loggedIn === true) {
    showUser(snapshot.val().data);
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
  var clerps = document.getElementById('clerps');
  var li = document.createElement("li");
  li.setAttribute('id',user.id);
  var a = document.createElement("a")
  a.setAttribute('href',user.link);
  var img = document.createElement("img");
  img.src="https://graph.facebook.com/" + user.id + "/picture/?type=large&return_ssl_resources=1";
  img.setAttribute("title",user.name);
  clerps.appendChild(li);
  li.appendChild(a);
  a.appendChild(img);
}

var removeUser = function (id) {
  var user = document.getElementById(id);
  user.parentNode.removeChild(user);
}

var presenceRef = people.child(uid+'/online');
// Make sure if I lose my connection I am marked as offline.
presenceRef.onDisconnect().set(false);
// Now, mark myself as online.
presenceRef.set(true);
