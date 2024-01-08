document.addEventListener('DOMContentLoaded', loadCategories);

document.getElementById('categoryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let category = document.getElementById('category').value.trim();
    let fullOrHalf = parseInt(document.getElementById('fullOrHalf').value, 10);

    if (category && !isNaN(fullOrHalf)) {
        let categoryData = { name: category, fullOrHalf: fullOrHalf };
        addCategoryToLocalStorage(categoryData);
        addCategoryToSelect(category);
        document.getElementById('category').value = '';
        document.getElementById('fullOrHalf').value = '';
    }
});

document.getElementById('gradeForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let gradeNumberStr = document.getElementById('gradeNumber').value;
    let gradeNumber = parseFloat(gradeNumberStr);
    let gradeCategory = document.getElementById('gradeCategory').value;
    let relevance = parseInt(document.getElementById('relevance').value, 10);

    if (!isNaN(gradeNumber) && gradeNumber >= 1 && gradeNumber <= 6 && 
        gradeCategory && !isNaN(relevance) && relevance >= 0 && relevance <= 100) {
        addGradeToLocalStorage(gradeNumber, gradeCategory, relevance);
        console.log('Grade Added:', { gradeNumber, gradeCategory, relevance });
        document.getElementById('gradeNumber').value = ''; // Reset the input fields
        document.getElementById('relevance').value = '100';
    } else {
        // Handle invalid input
        console.error('Invalid input');
        alert('Please enter valid values for all fields');
    }
});

function addCategoryToLocalStorage(category) {
    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    categories.push(category);
    localStorage.setItem('categories', JSON.stringify(categories));
}

function loadCategories() {
    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    if (categories.length > 0) {
        document.getElementById('gradeCategory').innerHTML = '';
        categories.forEach(categoryData => addCategoryToSelect(categoryData.name));
    } else {
        document.getElementById('gradeCategory').innerHTML = '<option value="">Keine Vorhanden</option>';
    }
}

function addCategoryToSelect(category) {
    let select = document.getElementById('gradeCategory');
    let option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    select.appendChild(option);
}

function addGradeToLocalStorage(gradeNumber, category, relevance) {
    let grades = JSON.parse(localStorage.getItem('grades')) || [];
    grades.push({ gradeNumber, category, relevance });
    localStorage.setItem('grades', JSON.stringify(grades));
}