const collapsibles = document.getElementsByClassName("collapsible");
for (const coll of collapsibles) {
    coll.addEventListener("click", function() {
        this.classList.toggle("active");
        let content = this.nextElementSibling;
        if (content.style.maxHeight){
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}

const searchFormElem = document.querySelector('form');
const searchButton = document.querySelector('.search-button');
searchButton.addEventListener('click', () => {
    const formData = new FormData(searchFormElem);
    const formDataMap = Object.fromEntries(formData.entries());
    const parsedData = parseFormData(formDataMap);
    const jsonData = JSON.stringify(parsedData);

    let fetchResult;
    if (jsonData != '{}') {
        fetchResult = fetch('/workouts/filtered', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: jsonData
        });
    } else {
        fetchResult = fetch('/api/workouts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    fetchResult.then(response => response.json())
        .then((json: {'workouts': WorkoutModel[]}) => {
            rerenderWorkouts(json.workouts);
        })
})

function parseFormData(formDataMap: { [key: string]: FormDataEntryValue | string; }) {
    let parsedData = {};
    let types = [], difficulties = [], focuses = [];

    for (let [key, value] of Object.entries(formDataMap)) {
        if (key == 'title' && value != '') {
            parsedData[key] = value;
        }

        const [fieldType, fieldValue] = key.split('-');

        switch (fieldType) {
            case 'type':
                types.push(fieldValue);
                break
            case 'diff':
                difficulties.push(fieldValue);
                break
            case 'focus':
                focuses.push(fieldValue);
                break
        }
    }

    if (types.length != 0 && types.length != 5 )
        parsedData['types'] = types;
    if (difficulties.length != 0 && difficulties.length != 3)
        parsedData['difficulties'] = difficulties;
    if (focuses.length != 0 && focuses.length != 4)
        parsedData['focuses'] = focuses;

    return parsedData;
}

function rerenderWorkouts(workouts) {
    const myNode = document.querySelector(".workout-list");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }

    for (const workout of workouts) {
        renderWorkout(workout);
    }
}

let workoutListElem = document.querySelector('.workout-list');
function renderWorkout(workout) {
    let workoutElem = document.createElement('div')
    workoutElem.innerHTML = `
<a href="/workouts/${workout.id}">
    <div class="workout-item">
        <img class="image" src="${workout.image}" alt="">
        <div class="tag-line">
            <div class="tag">Type: ${workout.type}</div>
            <div class="tag">Focus: ${workout.focus}</div>
            <div class="tag">Difficulty: ${workout.difficulty}</div>
        </div>
        <div class="action-buttons">
            <div class="action-button"><i class="fas fa-edit"></i></div>
            <div class="action-button"><i class="far fa-trash-alt"></i></div>
            <div class="action-button"><i class="far fa-heart"></i></i></div>
        </div>
        <div class="title">${workout.title}</div>
    </div>
</a>`;
    workoutListElem.appendChild(workoutElem);
}
