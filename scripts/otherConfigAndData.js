function getAdminUser1IdNumber() {
    return 4
}

function getAdminUser2IdNumber() {
    return 5
}

function getBillingStatusList() {
    return JSON.parse(`[{"id": "1", "name": "Unbilled"},
    {"id": "2", "name": "Billed"},
    {"id": "3", "name": "Written off"}]`)
}

// function getProjectList() {
//     return JSON.parse(`[{"id": "1", "identifier": "client-a", "name": "Client A"},
//     // {"id": "2", "identifier": "client-b", "name": "Client B"}]`)
// }

function getCategoryList() {
    return JSON.parse(`[{"id": "14", "name": "Audit"},
    {"id": "15", "name": "Income Tax"},
    {"id": "16", "name": "VAT"},
    {"id": "17", "name": "Reverse Charge"},
    {"id": "18", "name": "Accountancy"},
    {"id": "19", "name": "Secretarial"},
    {"id": "20", "name": "Property Administration"},
    {"id": "31", "name": "PTT"},
    {"id": "27", "name": "Tax"},
    {"id": "21", "name": "PAYE"},
    {"id": "22", "name": "NAPSA"},
    {"id": "28", "name": "NHIMA"},
    {"id": "29", "name": "WCF"},
    {"id": "23", "name": "TOT"},
    {"id": "24", "name": "WHT"},
    {"id": "30", "name": "TLEVY"},
    {"id": "25", "name": "Special Assignment"},
    {"id": "26", "name": "Non-billable"}]`)
}

function getUserList() {
    return JSON.parse(`[{"id": "6", "name": "Alice", "grade": "T2", "order": "1"},
    {"id": "7", "name": "Bob", "grade": "G2", "order": "3"},
    {"id": "4", "name": "admin", "grade": "", "order": "0"},
    {"id": "8", "name": "Carrol", "grade": "Supervisor", "order": "2"}]`)
}

function getGradeOrder() {
    return [
        "Assistant Manager",
        "Supervisor",
        "S2",
        "S1",
        "G2",
        "G1",
        "T2",
        "T1"
    ]
}

function addGradeOrderToUserList(inputArray) {
    const tempArray = []
    for (let i = 0; i <= inputArray.length - 1; i++) {
        if (inputArray[i].grade === "Assistant Manager") {
            tempArray.push({...inputArray[i], gradeOrder: 1})
        } else if (inputArray[i].grade === "Supervisor") {
            tempArray.push({...inputArray[i], gradeOrder: 2})
        } else if (inputArray[i].grade === "S2") {
            tempArray.push({...inputArray[i], gradeOrder: 3})
        } else if (inputArray[i].grade === "S1") {
            tempArray.push({...inputArray[i], gradeOrder: 4})
        } else if (inputArray[i].grade === "G2") {
            tempArray.push({...inputArray[i], gradeOrder: 5})
        } else if (inputArray[i].grade === "G1") {
            tempArray.push({...inputArray[i], gradeOrder: 6})
        } else if (inputArray[i].grade === "T2") {
            tempArray.push({...inputArray[i], gradeOrder: 7})
        } else if (inputArray[i].grade === "T1") {
            tempArray.push({...inputArray[i], gradeOrder: 8})
        } else {
            tempArray.push({...inputArray[i], gradeOrder: 0})
        }
    }
    return tempArray
}

function getPeriodList() {
    return [
        "2021",
        "2020",
        "2019",
        "2019/2020",
        "2018",
        "2017",
        "January 2021",
        "January 2020",
        "February 2021",
        "February 2020",
        "March 2021",
        "March 2020",
        "April 2021",
        "April 2020",
        "May 2021",
        "May 2020",
        "June 2021",
        "June 2020",
        "July 2021",
        "July 2020",
        "August 2021",
        "August 2020",
        "September 2021",
        "September 2020",
        "October 2021",
        "October 2020",
        "November 2021",
        "November 2020",
        "December 2021",
        "December 2020",
        "Unknown"
    ]
}

function getCustom() {
    return {
        billingStatus: "customField5",
        feeNoteNumber: "customField6"
    }
}

export {
    getAdminUser1IdNumber,
    getAdminUser2IdNumber,
    getBillingStatusList,
    // getProjectList,
    getCategoryList,
    getUserList,
    getGradeOrder,
    addGradeOrderToUserList,
    getPeriodList,
    getCustom
}