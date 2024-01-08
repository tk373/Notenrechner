document.addEventListener('DOMContentLoaded', function() { // Eventlistener when page loads
    loadGrades();
    document.getElementById('clearStorageButton').addEventListener('click', clearLocalStorage);

    var closeDialogButton = document.getElementById('closeDialog2');
    closeDialogButton.addEventListener('click', function() {
        var dialog = document.getElementById('neededGradeDialog');
        dialog.close();
    });

    var closeDialogButton = document.getElementById('closeDialog');
    closeDialogButton.addEventListener('click', function() {
        var dialog = document.getElementById('gradeCalculationDialog');
        dialog.close();
    });
});

function loadGrades() {
    let grades = JSON.parse(localStorage.getItem('grades')) || [];
    let categories = JSON.parse(localStorage.getItem('categories')) || [];
    let categoryRelevanceMap = {};

   
    categories.forEach(function(category) {  // Map category names to their relevance (fullOrHalf) for calculating the overall average
        categoryRelevanceMap[category.name] = category.fullOrHalf;
    });

    let weightedSum = 0;
    let totalNormalizedWeight = 0;
    let processedCategories = {};

    grades.forEach(function(grade) { // Maping grades for 
        let categoryRelevance = categoryRelevanceMap[grade.category] || 100; // Default relevance is 100
        if (!processedCategories[grade.category]) {
            processedCategories[grade.category] = { sumOfGrades: 0, count: 0, relevance: categoryRelevance, grades: [] };
        }
        processedCategories[grade.category].sumOfGrades += grade.gradeNumber;
        processedCategories[grade.category].count++;
        processedCategories[grade.category].grades.push({ number: grade.gradeNumber, relevance: grade.relevance });
    });

    let tableBody = document.getElementById('gradesTable').getElementsByTagName('tbody')[0];

    Object.keys(processedCategories).forEach(function(category, index) {
        let categoryData = processedCategories[category];
        let avg = categoryData.sumOfGrades / categoryData.count;
        let roundedAvg = Math.round(avg * 2) / 2;
        let normalizedRelevance = categoryData.relevance / 100;
        let numOfGrades = categoryData.count

        weightedSum += roundedAvg * normalizedRelevance;
        totalNormalizedWeight += normalizedRelevance;

        let row = tableBody.insertRow();
        let cellCategory = row.insertCell(0);
        cellCategory.textContent = category;

        let cellAvgGrade = row.insertCell(1);
        cellAvgGrade.textContent = avg.toFixed(2); // Display unrounded average

        let cellGradesPerSemester = row.insertCell(2);
        let gradesPerSemesterInput = document.createElement('input');
        gradesPerSemesterInput.type = 'text';
        gradesPerSemesterInput.readOnly = true;
        gradesPerSemesterInput.value = numOfGrades; // Number of grades in the category
        gradesPerSemesterInput.min = 1;   
        cellGradesPerSemester.appendChild(gradesPerSemesterInput); // Displays the number of grades in the table

        let cellAction = row.insertCell(3); 
        let button = document.createElement('button');
        button.textContent = 'Show Grades';
        button.onclick = function() {
            toggleGradesDisplay(index);
        };
        cellAction.appendChild(button); // Adds the button to the table for displaying all the grades in the category

        let cellCalculateGrade = row.insertCell(4);
        let calculateGradeButton = document.createElement('button');
        calculateGradeButton.textContent = 'Calculate Grade';
        calculateGradeButton.dataset.avgGrade = avg; // Store the average grade
        calculateGradeButton.dataset.numOfGrades = numOfGrades; // Store the number of grades
        calculateGradeButton.addEventListener('click', function() {
            openGradeCalculationDialog(this.dataset.avgGrade, this.dataset.numOfGrades);
        });
        cellCalculateGrade.appendChild(calculateGradeButton);

        let miniTableRow = tableBody.insertRow();
        miniTableRow.id = 'miniTableRow' + index;
        miniTableRow.style.display = 'none';
        let miniTableCell = miniTableRow.insertCell(0);
        miniTableCell.colSpan = 3;

        let miniTable = document.createElement('table');
        let miniTableBody = miniTable.createTBody();

        categoryData.grades.forEach(function(grade) {    // Function for getting the relevant information to display grades
            let miniTableRow = miniTableBody.insertRow();
            let gradeCell = miniTableRow.insertCell(0);
            let relevanceCell = miniTableRow.insertCell(1);

            gradeCell.textContent = 'Note: ' + grade.number;
            relevanceCell.textContent = 'Relevanz: ' + (grade.relevance) + '%';
        });

        miniTableCell.appendChild(miniTable); // Adds the minitables with the grades to the overrall table
    });

    if (totalNormalizedWeight > 0) {
        let overallAvg = weightedSum / totalNormalizedWeight;
        displayOverallAverage(overallAvg);
    }
}

function displayOverallAverage(overallAvg) {
    let tableBody = document.getElementById('gradesTable').getElementsByTagName('tbody')[0];
    let row = tableBody.insertRow();
    row.className = 'overall-average';
    let cell = row.insertCell(0); // Adds the overall average Grade to the botton of the table
    cell.colSpan = 3;
    cell.textContent = 'Gesamtdurschnitt: ' + overallAvg.toFixed(2);
}

function toggleGradesDisplay(index) {
    let miniTableRow = document.getElementById('miniTableRow' + index);
    miniTableRow.style.display = miniTableRow.style.display === 'none' ? '' : 'none';
}

function clearLocalStorage() {
    if (confirm('Are you sure you want to clear all data?')) {
        localStorage.clear();
        alert('All data has been cleared.');
        loadGrades();
    }
}

function openGradeCalculationDialog(avgGrade, numOfGrades) {
    document.getElementById('gradeCalculationDialog').showModal();
    document.getElementById('dialogForm').clickedButtonData = {
        avgGrade: avgGrade,
        numOfGrades: numOfGrades
    };
}

document.getElementById('dialogForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let desiredAverage = parseFloat(document.getElementById("desiredAverage").value);
    let outstandingGrades = parseInt(document.getElementById("outstandingGrades").value, 10);
    let avgGrade = parseFloat(this.clickedButtonData.avgGrade);
    let numOfGrades = parseInt(this.clickedButtonData.numOfGrades, 10);

    let totalgrades =  outstandingGrades + numOfGrades;
    let totalAmount = desiredAverage * totalgrades;
    let neededAmount = totalAmount - avgGrade * numOfGrades;

    let neededGrade = neededAmount / outstandingGrades;

    let displayGradeText;
    if (neededGrade > 6) {
        displayGradeText = "Nicht möglich, benötigte Note zu hoch";
    } else {
        if(neededGrade < 0){
            let one = avgGrade * numOfGrades;
            let two = 1 * outstandingGrades;
            let three = one + two;
            let four = numOfGrades + 1 * outstandingGrades;
            let minimalGrade = three / four;
            displayGradeText = `Nicht möglich, Niedrigste Note, die Sie mit alles 1er erreichen können ist ${minimalGrade.toFixed(2)}`;
        } else{
            displayGradeText = `Sie brauchen noch ${outstandingGrades}x ein(e) ${neededGrade.toFixed(2)}`;
        }
    }

    console.log(displayGradeText);

    document.getElementById('calculationResult').textContent = displayGradeText;
    document.getElementById('neededGradeDialog').showModal();
});



