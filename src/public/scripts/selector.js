// below functions is called in index page
function updateData() { 
    const selectedResol = document.getElementById('inputDescr').value;
    const selectedcomm = document.getElementById(selectedResol);
    const selectedCat = document.getElementsByTagName("input")[selectedResol].getAttribute('name');
    document.getElementById('inputComment').value = selectedcomm.value;
    document.getElementById('inputCategory').value = selectedCat;
}

// below function is called in search page
function updateComment() {
    const selectedResol = document.getElementById('inputDescr').value;
    const selectedcomm = document.getElementById(selectedResol);
    const selectedCat = document.getElementsByTagName("input")[selectedResol].getAttribute('name');
    document.getElementById('inputComment').value = selectedcomm.value;
    document.getElementById('inputCategory').value = selectedCat;
}

// below funtion is called in config page
function getComment() {
    const selectedResol = document.getElementById('inputRes').value;
    const selectedcomm = document.getElementById(selectedResol);
    const selectedCat = document.getElementsByTagName("input")[selectedResol].getAttribute('name');
    document.getElementById('inputComment').value = selectedcomm.value;
    document.getElementById('inputCategory').value = selectedCat;
}

