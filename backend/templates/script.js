function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password");
    const json_datav2 = {
        username: username,
        password: password,
    };

    const xhttp = new XMLHttpRequest();
    const method = "POST";
    const url = "http://127.0.0.1:5000/login";

    const async = true;
    xhttp.open(method, url, async);
    console.log(JSON.stringify(json_datav2));
    xhttp.send(JSON.stringify(json_datav2));
    xhttp.onload = function() {
        console.log(this.responseText);
    };
}