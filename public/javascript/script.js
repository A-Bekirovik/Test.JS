

const dropdownBtn = document.getElementById('dropbtna')
const dropdownMenu = document.getElementById('myDropdown')

function myFunction() {
    dropdownMenu.classlist.toggle('show');
}

dropdownBtn.addEventListener("click", function(e){
    e.stopPropagation();
    ToggleDropdown();
}) 

const ArrayList = '[{"name" : "Plant 1"}]'