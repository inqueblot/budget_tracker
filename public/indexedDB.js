let db;

const request = indexedDB.open("budgetDatabase", 1);



request.onupgradeneeded = ({ target }) => {
    const db = target.result;
    db.createObjectStore("budgetDatabase", { autoIncrement: true });
    // budgetStore.createIndex("nameIndex", "name");
    // budgetStore.createIndex("valueIndex", "value");
    // budgetStore.createIndex("dateIndex", "date");
};

request.onsuccess = ({ target }) => {
    db = target.result;

    if (navigator.online) {
        checkDatabase();
    }
};

request.onerror = ({ target }) => {
    console.log("Whoops! " + target.errorCode);
};

function saveRecord(record) {
    console.log(record)
    const transaction = db.transaction(["budgetDatabase"], "readwrite");

    const store = transaction.objectStore("budgetDatabase");
    // const nameIndex = budgetStore.index('nameIndex');
    // const valueIndex = budgetStore.index('valueIndex');
    // const dateIndex = budgetStore.index('dateIndex');
    // budgetStore.add({ name: record.name, value: record.value, date: record.date })
    store.add(record)
};

function checkDatabase() {
    const transaction = db.transaction(["budgetDatabase"], "readwrite");
    const store = transaction.objectStore("budgetDatabase")
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                .then(() => {
                    const transaction = db.transaction(["budgetDatabase"], "readwrite");
                    const store = transaction.objectStore("budgetDatabase");
                    store.clear();
                });
        }
    };
}

window.addEventListener("online", checkDatabase)