// subscribe.js
document.getElementById("subscribe-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;

  firebase.database().ref("subscribers").push({
    email: email,
    timestamp: new Date().toISOString()
  })
  .then(() => {
    alert("Thank you for subscribing!");
    document.getElementById("subscribe-form").reset();
  })
  .catch((error) => {
    alert("Error: " + error.message);
  });
});
