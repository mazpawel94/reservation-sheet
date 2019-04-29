$("#date").dateDropper();

const calendar = document.querySelector("#date");
const calendarPage = document.getElementById("datedropper-0");
const newReservation = document.querySelector(".reservation");
const description = document.querySelector('.description');
const selectTable = newReservation.querySelector("#select-table");
const selectHour = newReservation.querySelector("#select-hour");
const name = newReservation.querySelector("input");
const tablesScheme = document.querySelector(".tables");
const reservationDivs = document.getElementsByClassName("reservation");
const saveButton = document.querySelector(".save");
const weekDay = document.querySelector(".date-wrapper span");
const hoursWrapper = document.querySelector(".hours");
const hourDivs = document.querySelectorAll(".hour");
selectTable.value = '';
selectHour.value = '';

let active = false;
let ofX, ofY, topDistance, leftDistance, hourWidth, hourHeight;
const reservations = [];
const tableDistance = {
  leftRattan: 0,
  rightRattan: hourWidth,
  bigIndian: hourWidth * 2,
  smallIndian: hourWidth * 3,
  japanese: hourWidth * 4,
  leftChinese: hourWidth * 5,
  rightChinese: hourWidth * 6,
  board: hourWidth * 7,
  base: hourWidth * 8
};
const weekDays = [
  "niedziela",
  "poniedziałek",
  "wtorek",
  "środa",
  "czwartek",
  "piątek",
  "sobota"
];

const getTableByDistance = distance =>
  Object.keys(tableDistance).find(key => tableDistance[key] === distance);

const changePositionByHour = hour => {
  const separateHour = hour.split(":");
  const distance = separateHour[0] - 10; //10 - pierwsza godzina, na którą można robić rezerwacje
  return `${topDistance + hourHeight * (separateHour[1] / 60) + distance * hourHeight}px`;
};

const setReservationSize = reservation => {
  reservation.style.width = `${hourWidth}px`;
  reservation.style.height = `${hourHeight * 3}px`;
  reservation.style.left = `${leftDistance +
    tableDistance[reservation.querySelector("#select-table").value]}px`;
  reservation.style.top = changePositionByHour(
    reservation.querySelector("#select-hour").value
  );
};
const setSchemeSize = () => {
  [...tablesScheme.querySelectorAll(".table")].forEach(
    table =>
      (table.style.width = `${Math.floor((window.innerWidth * 0.85) / 9)}px`)
  );
  hoursWrapper.style.width = `${Math.floor((window.innerWidth * 0.85) / 9) *
    9}px`;
  hoursWrapper.style.height = `${Math.floor(
    (window.innerHeight * 0.8 - document.querySelector(".table").clientHeight) /
    11
  ) * 11}px`;
};
const setSize = () => {
  setSchemeSize();
  topDistance = hourDivs[0].offsetTop;
  leftDistance = hoursWrapper.offsetLeft;
  hourWidth = document.querySelector(".table").clientWidth;
  hourHeight = hourDivs[0].clientHeight;
  Object.keys(tableDistance).forEach(
    (key, index) => (tableDistance[key] = hourWidth * index)
  );
  [...reservationDivs].forEach(reservation => setReservationSize(reservation));
  if (!selectHour.value && !selectTable.value) {
    newReservation.style.top = "calc(50% - 50px)";
    newReservation.style.left = 0;
  }
};

function activeReservation(e) {
  if (
    !e.target.parentNode.classList.contains("reservation") ||
    e.target.nodeName === "INPUT"
  )
    return;
  active = true;
  ofX = e.offsetX;
  ofY = e.offsetY + 30; //30px - wysokość inputa rezerwacji
}

function dragReservation(e) {
  if (!active) return;
  description.classList.add('hidden');
  newReservation.style.left = `${e.clientX - ofX}px`;
  newReservation.style.top = `${e.clientY + window.scrollY - ofY}px`;
}

function putReservation(e) {
  active = false;
  if (
    !e.target.parentNode.classList.contains("new") ||
    e.target.nodeName === "INPUT"
  )
    return;
  setNewReservationValue();
  activeSaveButton();
}

const setNewReservationValue = () => {
  //zaokrąglamy left i top, tak by rezerwacja mieściła się w konretnej komórce
  newReservation.style.left = `${leftDistance +
    Math.floor(
      (parseInt(newReservation.style.left) - leftDistance + hourWidth / 2) /
      hourWidth
    ) *
    hourWidth}px`;
  newReservation.style.top = `${topDistance +
    Math.floor(
      (parseInt(newReservation.style.top) - topDistance) / hourHeight
    ) *
    hourHeight}px`;
  newReservation.style.backgroundColor = "rgb(180, 190, 39)";
  selectTable.value = getTableByDistance(
    parseInt(newReservation.style.left) - leftDistance
  );
  selectHour.value = `${(parseInt(newReservation.style.top) - topDistance) /
    hourHeight +
    10}:00`;
};

const createElementInNewDiv = reservationDiv => {
  const deleteDiv = document.createElement("div");
  deleteDiv.classList.add("delete", "hidden");
  const changeDiv = document.createElement("div");
  changeDiv.classList.add("diskette", "hidden");
  reservationDiv.appendChild(deleteDiv);
  reservationDiv.appendChild(changeDiv);
};

const createReservationFromBase = reservation => {
  const reservationDiv = document.createElement("div");
  reservationDiv.classList.add("reservation");
  reservationDiv.innerHTML = newReservation.innerHTML;
  reservationDiv.querySelector(".description").remove();
  createElementInNewDiv(reservationDiv);
  reservationDiv.querySelector("#select-table").value = reservation.table;
  reservationDiv.querySelector("#select-hour").value = reservation.hour;
  reservationDiv.querySelector("#select-guests").value = reservation.guests;
  reservationDiv.querySelector("input").value = reservation.name;
  setReservationSize(reservationDiv);
  reservationDiv.dataset.id = reservation._id;
  if (localStorage.getItem(reservationDiv.dataset.id) === "true")
    reservationDiv.classList.add("put");
  document.body.appendChild(reservationDiv);
};

const showDaylyReservations = () => {
  const day = calendar.value;
  [...document.querySelectorAll(".reservation")]
    .filter(reservation => !reservation.classList.contains("new"))
    .forEach(reservation => reservation.remove());
  reservations.forEach(reservation => {
    if (reservation.date === day) createReservationFromBase(reservation);
  });
  setWeekDay();
};

const addZero = integer => (integer < 10 ? `0${integer}` : integer);

const setSundayHours = () => {
  if (weekDay.textContent === "niedziela") {
    hourDivs[0].classList.add("sunday");
    hourDivs[1].classList.add("sunday");
    hourDivs[10].classList.add("sunday");
  } else hourDivs.forEach(hour => hour.classList.remove("sunday"));
};

const setWeekDay = () => {
  weekDay.textContent =
    weekDays[new Date(calendar.value.split("/").reverse()).getDay()];
  setSundayHours();
};

function changeDate(e) {
  const splitDate = calendar.value.split("/");
  const newDate = new Date(
    parseInt(splitDate[2]),
    parseInt(splitDate[1]),
    parseInt(splitDate[0]) + parseInt(e.target.dataset.value)
  );
  calendar.value = `${addZero(newDate.getDate())}/${addZero(
    newDate.getMonth()
  )}/${newDate.getFullYear()}`;
  showDaylyReservations();
  setWeekDay();
}

const add15Minutes = () => {
  if (parseInt(selectHour.value.split(":")[0]) >= 21) return;
  if (!selectHour.value) {
    selectHour.value = "14:00";
    newReservation.style.top = changePositionByHour(selectHour.value);
  }
  newReservation.style.top = `${parseFloat(newReservation.style.top) +
    hourHeight / 4}px`;
  const hourSeparate = selectHour.value.split(":");
  if (hourSeparate[1] == 45)
    selectHour.value = `${parseInt(hourSeparate[0]) + 1}:00`;
  else
    selectHour.value = `${hourSeparate[0]}:${parseInt(hourSeparate[1]) + 15}`;
};

const substract15Minutes = () => {
  if (selectHour.value === "10:00") return;
  if (!selectHour.value) {
    selectHour.value = "14:00";
    newReservation.style.top = changePositionByHour(selectHour.value);
  }
  newReservation.style.top = `${parseFloat(newReservation.style.top) -
    hourHeight / 4}px`;
  const hourSeparate = selectHour.value.split(":");
  if (hourSeparate[1] === "00")
    selectHour.value = `${parseInt(hourSeparate[0]) - 1}:45`;
  else {
    let minutes = parseInt(hourSeparate[1]) - 15;
    if (!minutes) minutes = "00";
    selectHour.value = `${parseInt(hourSeparate[0])}:${minutes}`;
  }
};

const goToLeft = () => {
  if (selectTable.value === "leftRattan") return;
  newReservation.style.left = `${parseInt(newReservation.style.left) -
    hourWidth}px`;
  selectTable.value = getTableByDistance(
    parseInt(newReservation.style.left) - leftDistance
  );
};

const goToRight = () => {
  if (selectTable.value === "base") return;
  if (!selectTable.value) {
    selectTable.value = "leftRattan";
    newReservation.style.left = `${leftDistance +
      tableDistance[selectTable.value]}px`;
    return;
  }
  newReservation.style.left = `${parseInt(newReservation.style.left) +
    hourWidth}px`;
  selectTable.value = getTableByDistance(
    parseInt(newReservation.style.left) - leftDistance
  );
};

const getReservationsFromBase = () => {
  fetch("https://czarka-api.herokuapp.com/demo-version")
    .then(resp => resp.json())
    .then(data => {
      data.forEach(reservation => reservations.push(reservation));
      showDaylyReservations(calendar.value);
      document.querySelector(".loader").remove();
    }
    );
}

const saveNewReservation = () => {
  if (!selectTable.value || !selectHour.value) return;
  saveButton.style.visibility = "hidden";
  fetch("https://czarka-api.herokuapp.com/demo-version", {
    method: "post",
    headers: {
      "Content-type": "application/json"
    },
    body: `{ "day": "${calendar.value}",
              "hour": "${selectHour.value}",
              "name": "${name.value}",
              "table":"${selectTable.value}",
              "guests": "${
      newReservation.querySelector("#select-guests").value
      }"
            }`
  })
    .then(res => location.reload());
}

const deleteReservation = id => {
  fetch("https://czarka-api.herokuapp.com/demo-version", {
    method: "delete",
    headers: {
      "Content-type": "application/json"
    },
    body: `{ "id": "${id}"}`
  })
    .then(res => location.reload())
}

const changeReservation = reservation => {
  fetch("https://czarka-api.herokuapp.com/demo-version", {
    method: "put",
    headers: {
      "Content-type": "application/json"
    },
    body: `{ "id": "${reservation.dataset.id}",
              "day": "${calendar.value}",
              "hour": "${reservation.querySelector("#select-hour").value}",
              "name": "${reservation.querySelector("input").value}",
              "table":"${reservation.querySelector("#select-table").value}",
              "guests": "${reservation.querySelector("#select-guests").value}"
            }`
  })
    .then(res => location.reload());
}

const activeSaveButton = () => {
  if (selectHour.value && selectTable.value && name.value)
    return saveButton.classList.remove('disabled');
  saveButton.classList.add('disabled');
}
saveButton.addEventListener("click", saveNewReservation);
calendarPage.addEventListener("click", showDaylyReservations);
document.getElementById("previous-day").addEventListener("click", changeDate);
document.getElementById("next-day").addEventListener("click", changeDate);
newReservation.addEventListener("mousedown", activeReservation);
document.addEventListener("mousemove", dragReservation);
document.addEventListener("mouseup", putReservation);
selectTable.addEventListener(
  "change",
  e => {
    newReservation.style.left = `${tableDistance[e.target.value] +
      leftDistance}px`;
    activeSaveButton();
  });
selectHour.addEventListener(
  "change",
  e => {
    newReservation.style.top = changePositionByHour(e.target.value);
    activeSaveButton();
  }
);
name.addEventListener("input", activeSaveButton);
//delegacja zdarzeń - nasłuchiwanie na usunięcie rezerwacji lub jej zmianę
document.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete")) {
    deleteReservation(e.target.parentNode.dataset.id);
  }
  if (e.target.classList.contains("diskette")) {
    changeReservation(e.target.parentNode);
  }
});

//oznaczanie rezerwacji jako położona - zapis w local storage
document.addEventListener("dblclick", function (e) {
  if (e.target.classList.contains("select-wrapper")) {
    e.target.classList.toggle("put");
    localStorage.setItem(
      e.target.parentNode.dataset.id,
      e.target.classList.contains("put")
    );
  }
});

document.querySelector(".unlock-delete").addEventListener("click", () => {
  document
    .querySelectorAll(".delete")
    .forEach(e => e.classList.toggle("hidden"));
});

document.querySelector(".unlock-change").addEventListener("click", () => {
  document
    .querySelectorAll(".diskette")
    .forEach(e => e.classList.toggle("hidden"));
});

document.addEventListener("keydown", e => {
  description.classList.add('hidden');
  if (e.keyCode === 40) add15Minutes();
  if (e.keyCode === 38) substract15Minutes();
  if (e.keyCode === 37) goToLeft();
  if (e.keyCode === 39) goToRight();
  if (e.keyCode === 13) saveNewReservation();
});
window.addEventListener("resize", setSize);

setSize();
getReservationsFromBase();
