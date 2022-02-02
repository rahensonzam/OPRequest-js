// import { $, jQuery } from "./libs/jquery/jquery.module.js"
// import "./libs/jquery/jquery-3.5.1.js"
// import "./libs/jquery/jquery.module.js"
// import $ from "./libs/jquery/jquery-3.5.1.js"
import { passwordToApiKey, passwordAndApiKeyMatch } from "./apiKeyListFile.js"
import {
    getAdminUser1IdNumber,
    getAdminUser2IdNumber,
    getBillingStatusList,
    // getProjectList,
    getCategoryList,
    getUserList,
    addGradeOrderToUserList,
    getPeriodList
} from "./otherConfigAndData.js"
import { actions, webErrorTypes, doActionAsync, webErrorsPresent } from "./OPRequest.js"

// import * as Papa from "./libs/papaparse/papaparse.js"
// import { $ } from "./libs/jquery/jquery-3.5.1.js"

document.getElementById("single").addEventListener("click", showHideUI)
document.getElementById("sequenceWeekly").addEventListener("click", showHideUI)
document.getElementById("sequenceDaily").addEventListener("click", showHideUI)
document.getElementById("sequenceExportExtract").addEventListener("click", showHideUI)
document.getElementById("sequenceExportSummarizeUt").addEventListener("click", showHideUI)
document.getElementById("sequenceExportSummarizeCat").addEventListener("click", showHideUI)
document.getElementById("sequenceExportBreakdownCat").addEventListener("click", showHideUI)
document.getElementById("sequenceExportBreakdownClient").addEventListener("click", showHideUI)
document.getElementById("staticListsCheckbox").addEventListener("change", showHideUI)
document.getElementById("csvCreate").addEventListener("click", showHideUI)
document.getElementById("csvImport").addEventListener("click", showHideUI)
document.getElementById("csvImport2").addEventListener("click", showHideUI)
document.getElementById("enterPassword").addEventListener("click", fillApiKey)
document.getElementById("user").addEventListener("change", checkApiKeyYellow)
document.getElementById("go1Button").addEventListener("click", runActions)
document.getElementById("go2Button").addEventListener("click", runSpreadsheetDone)

dayjs.extend(window.dayjs_plugin_customParseFormat)
const logTextBox = document.getElementById("log").children[0]
const validDateFormats = ["DD-MM-YYYY","DD/MM/YYYY"]
let wpConvertUser
const adminUser1 = getAdminUser1IdNumber()
const adminUser2 = getAdminUser2IdNumber()
let apiKey
let weekBegin
let dateEndPeriod
let numberOfWeeks
let filterToOneUserBool
let actionType
let csvType
let fileSelect
let staticLists
let billingStatusReportFilter
let workPackageListFileSelect
let timeEntryListFileSelect
let projectList
let periodList
let categoryList
let workPackageList
let timeEntryList
let userList
// let billingStatusList
// let mySpreadsheet
// let firstHalfAlready = false
let firstHalfUsingSpreadsheet = false
let firstHalfNotFirstTime = false
let firstHalfRunning = false
let firstHalfSucessful = false
let secondHalfNotFirstTime = false
let secondHalfRunning = false

const logType = {
    normal: "line",
    error: "line error",
    step: "line step",
    finished: "line finished",
}

const actionTypes = {
    sequenceWeekly: "sequenceWeekly",
    sequenceDaily: "sequenceDaily",
    sequenceExportExtract: "sequenceExportExtract",
    sequenceExportSummarizeUt: "sequenceExportSummarizeUt",
    sequenceExportSummarizeCat: "sequenceExportSummarizeCat",
    sequenceExportBreakdownCat: "sequenceExportBreakdownCat",
    sequenceExportBreakdownClient: "sequenceExportBreakdownClient",
    single: "single"
}

const csvTypes = {
    import: "import",
    import2: "import2",
    create: "create",
}

const preReqTypes = {
    sequence: "sequence",
    secondHalf: "secondHalf",
    password: "password",
}

const billingStatusList = getBillingStatusList()

$(function() {
    if (localStorage.getItem("userStore") !== null) {
        document.getElementById("user").value = localStorage.getItem("userStore")
        document.getElementById("apiKeyBox").value = localStorage.getItem("apiKeyStore")
    }
})

function showHideUI() {

    actionType = getSelectedRadioButtonValue("actionType")
    csvType = getSelectedRadioButtonValue("csvType")
    const staticListsCheckboxChecked = document.getElementById("staticListsCheckbox").checked

    if (actionType === actionTypes.single) {
        //showAction
        showHideUtil("actionLabel", "inline")
        showHideUtil("actionSelect", "block")
        showHideUtil("actionSelectLogCheckbox", "inline")
        showHideUtil("actionSelectLogLabel", "inline")
    } else {
        //hideAction
        showHideUtil("actionLabel", "none")
        showHideUtil("actionSelect", "none")
        showHideUtil("actionSelectLogCheckbox", "none")
        showHideUtil("actionSelectLogLabel", "none")
    }

    if (actionType === actionTypes.sequenceDaily) {
        //hideWeek
        showHideUtil("weekBeginLabel", "none")
        showHideUtil("weekBeginBox", "none")
    } else {
        //showWeek
        showHideUtil("weekBeginLabel", "inline")
        showHideUtil("weekBeginBox", "inline")
    }

    if (actionType === actionTypes.sequenceExportExtract
        || actionType === actionTypes.single) {
        //showNumberOfWeeks
        showHideUtil("numberOfWeeksLabel", "inline")
        showHideUtil("numberOfWeeksBox", "inline")
        //showfilterToOneUser
        showHideUtil("filterToOneUserCheckbox", "inline")
        showHideUtil("filterToOneUserLabel", "inline")
    } else {
        //hideNumberOfWeeks
        showHideUtil("numberOfWeeksLabel", "none")
        showHideUtil("numberOfWeeksBox", "none")
        //hidefilterToOneUser
        showHideUtil("filterToOneUserCheckbox", "none")
        showHideUtil("filterToOneUserLabel", "none")
    }

    if (actionType === actionTypes.sequenceExportSummarizeUt
        || actionType === actionTypes.sequenceExportSummarizeCat
        || actionType === actionTypes.sequenceExportBreakdownCat
        || actionType === actionTypes.sequenceExportBreakdownClient
        || actionType === actionTypes.single) {
        //showDateEndPeriod
        showHideUtil("dateEndPeriodLabel", "inline")
        showHideUtil("dateEndPeriodBox", "inline")
    } else {
        //hideDateEndPeriod
        showHideUtil("dateEndPeriodLabel", "none")
        showHideUtil("dateEndPeriodBox", "none")
    }

    if (actionType === actionTypes.sequenceExportExtract
        || actionType === actionTypes.sequenceExportSummarizeUt
        || actionType === actionTypes.sequenceExportSummarizeCat
        || actionType === actionTypes.sequenceExportBreakdownCat
        || actionType === actionTypes.sequenceExportBreakdownClient) {
        //hideCsvChooser
        showHideUtil("csvChooser", "none")

        hideLoadFile()
        // hideLinks()
    } else {
        //showCsvChooser
        showHideUtil("csvChooser", "block")

        if (csvType === csvTypes.create) {
            hideLoadFile()
        } else {
            showLoadFile()
        }
        // if (csvType === csvTypes.import2) {
        //     // showLinks()
        // } else {
        //     // hideLinks()
        // }
    }

    if (actionType === actionTypes.sequenceExportExtract
        || actionType === actionTypes.sequenceExportSummarizeUt
        || actionType === actionTypes.sequenceExportSummarizeCat
        || actionType === actionTypes.sequenceExportBreakdownCat
        || actionType === actionTypes.sequenceExportBreakdownClient
        || actionType === actionTypes.single) {
        //showStaticListsCheckbox
        showHideUtil("staticListsCheckbox", "inline")
        showHideUtil("staticListsLabel", "inline")
    } else {
        //hidestaticListsCheckbox
        showHideUtil("staticListsCheckbox", "none")
        showHideUtil("staticListsLabel", "none")
    }

    if (actionType === actionTypes.sequenceExportSummarizeCat
        || actionType === actionTypes.sequenceExportBreakdownCat
        || actionType === actionTypes.sequenceExportBreakdownClient
        || actionType === actionTypes.single) {
        showHideUtil("billingStatusReportFilterSelect", "inline")
        showHideUtil("billingStatusReportFilterLabel", "inline")
    } else {
        showHideUtil("billingStatusReportFilterSelect", "none")
        showHideUtil("billingStatusReportFilterLabel", "none")
    }

    if (actionType === actionTypes.single) {
        showStaticFile()
    } else {
        if (staticListsCheckboxChecked) {
            if (actionType === actionTypes.sequenceExportExtract
                || actionType === actionTypes.sequenceExportSummarizeUt
                || actionType === actionTypes.sequenceExportSummarizeCat
                || actionType === actionTypes.sequenceExportBreakdownCat
                || actionType === actionTypes.sequenceExportBreakdownClient) {
                showStaticFile()
            }
        } else {
            hideStaticFile()
        }
    }
}

function showHideUtil(element, value) {
    document.getElementById(element).style.display = value;
}

function showLoadFile() {
    showHideUtil("fileLabelP", "block")
    showHideUtil("fileSelectP", "block")
}

function hideLoadFile() {
    showHideUtil("fileLabelP", "none")
    showHideUtil("fileSelectP", "none")
}

function showStaticFile() {
    showHideUtil("fileListWLabelP", "block")
    showHideUtil("fileListWSelectP", "block")
    showHideUtil("fileListTLabelP", "block")
    showHideUtil("fileListTSelectP", "block")
}

function hideStaticFile() {
    showHideUtil("fileListWLabelP", "none")
    showHideUtil("fileListWSelectP", "none")
    showHideUtil("fileListTLabelP", "none")
    showHideUtil("fileListTSelectP", "none")
}

// function showLinks() {
// 	showHideUtil("weeklyHref1", "block")
// 	showHideUtil("weeklyHref2", "block")
// 	showHideUtil("dailyHref1", "block")
// 	showHideUtil("dailyHref2", "block")
// }

// function hideLinks() {
// 	showHideUtil("weeklyHref1", "none")
// 	showHideUtil("weeklyHref2", "none")
// 	showHideUtil("dailyHref1", "none")
// 	showHideUtil("dailyHref2", "none")
// }

function showSpreadsheet() {
    showHideUtil("spreadsheet1", "block")
}

// function hideSpreadsheet() {
// 	showHideUtil("spreadsheet1", "none")
// }

function showLoading() {
    showHideUtil("loading", "inline")
}

function hideLoading() {
    showHideUtil("loading", "none")
}

function apiKeyMakeYellow() {
    document.getElementById("apiKeyBox").style.backgroundColor = "yellow"
}

function apiKeyRemoveYellow() {
    document.getElementById("apiKeyBox").style.backgroundColor = "revert"
}

function checkApiKeyYellow() {
    const user = document.getElementById("user").value
    const apiKeyRetrived = document.getElementById("apiKeyBox").value
    if (passwordAndApiKeyMatch(user, apiKeyRetrived)) {
        apiKeyRemoveYellow()
    } else {
        apiKeyMakeYellow()
    }
}

function fillApiKey() {
    const user = document.getElementById("user").value
    const password = document.getElementById("passwordBox").value
    const apiKeyRetrived = passwordToApiKey(user, password)

    const preReq = checkPreReq(preReqTypes.password, user, apiKeyRetrived, "", "", "", "", "")
    if (preReq) {
        document.getElementById("apiKeyBox").value = apiKeyRetrived
    }
    checkApiKeyYellow()
}

async function runActions() {

    // FIXME: integrate into checkPreReq()
    if (firstHalfRunning === true) {
        return
    }

    if (firstHalfUsingSpreadsheet === true) {
        writeToLog(`error: In order to run again, reload the page. Otherwise you may continue.`, "error", logType.error)
        return
    }

    if (firstHalfNotFirstTime) {
        if (!(window.confirm("Run again from beginning, are you sure?"))) {
            return
        } else {
            writeSeparatorToLog()
        }
    }

    checkApiKeyYellow()
    wpConvertUser = document.getElementById("user").value
    apiKey = document.getElementById("apiKeyBox").value
    weekBegin = document.getElementById("weekBeginBox").value
    dateEndPeriod = document.getElementById("dateEndPeriodBox").value
    numberOfWeeks = Number(document.getElementById("numberOfWeeksBox").value)
    fileSelect = document.getElementById("fileSelect")
    staticLists = document.getElementById("staticListsCheckbox").checked
    filterToOneUserBool = document.getElementById("filterToOneUserCheckbox").checked
    billingStatusReportFilter = document.getElementById("billingStatusReportFilterSelect").value
    workPackageListFileSelect = document.getElementById("workPackageListFileSelect")
    timeEntryListFileSelect = document.getElementById("timeEntryListFileSelect")

    actionType = getSelectedRadioButtonValue("actionType")
    csvType = getSelectedRadioButtonValue("csvType")

    const preReq = checkPreReq(preReqTypes.sequence, wpConvertUser, apiKey, weekBegin, dateEndPeriod, numberOfWeeks, csvType, fileSelect.files[0])
    if (!preReq) {
        return
    }

    firstHalfNotFirstTime = true
    firstHalfRunning = true
    firstHalfSucessful = false

    //TODO: Individual Action diverts here
    if (actionType === actionTypes.single) {
        showLoading()
        const currentStep = await runSingleAction()
        hideLoading()
        firstHalfRunning = false
        if (currentStep.halt) {
            return
        }
        // firstHalfSucessful = true
        return
    }

    if (actionType === actionTypes.sequenceWeekly
        || actionType === actionTypes.sequenceDaily) {
        if (csvType === csvTypes.create) {
            firstHalfUsingSpreadsheet = true
        }
    }

    showLoading()

    if (!(wpConvertUser == adminUser1
        || wpConvertUser == adminUser2)) {
        localStorage.setItem("userStore", wpConvertUser)
        localStorage.setItem("apiKeyStore", apiKey)
    }

    weekBegin = dayjs(weekBegin, validDateFormats).format('YYYY-MM-DD')
    dateEndPeriod = dayjs(dateEndPeriod, validDateFormats).format('YYYY-MM-DD')

    const stepFirstHalf = await runFirstHalf()
    if (stepFirstHalf.halt) {
        hideLoading()
        firstHalfRunning = false
        return
    }

    const justProjectNamesList = getJustNames(projectList, true)
    const justCategoryNamesList = getJustNames(categoryList, false)

    if (actionType === actionTypes.sequenceWeekly) {
        writeToLog("step: 2/8 action: csvInput", "step", logType.step)
        console.log("step: 2/8 action: csvInput")

        if (csvType === csvTypes.create
            || csvType === csvTypes.import) {
            // const spreadsheetCsvFilename = getCsvFilename()

            showSpreadsheet()

            makeWeeklySpreadsheet(justProjectNamesList, periodList, justCategoryNamesList)

            // if (csvType === csvTypes.import) {

            //     const myCsvFile = await parseCSVFile(fileSelect.files[0])
            //     //FIX: Move ad-hoc CSV Validation
            //     if (myCsvFile.rows[0].length !== 11) {
            //         console.error("imported CSV wrong number of columns")
            //         return
            //     }
            //     for (let i = 0; i <= myCsvFile.rows.length - 1; i++) {
            //         $('#spreadsheet1')["jexcel"]('insertRow', myCsvFile.rows[i], 1)
            //     }
            //     $('#spreadsheet1')["jexcel"]('deleteRow', 0)
            //     $('#spreadsheet1')["jexcel"]('deleteRow', 0)
            // }
        }
    }
    if (actionType === actionTypes.sequenceDaily) {
        writeToLog("step: 2/6 action: csvInput", "step", logType.step)
        console.log("step: 2/6 action: csvInput")

        if (csvType === csvTypes.create
            || csvType === csvTypes.import) {
            // const spreadsheetCsvFilename = getCsvFilename()

            showSpreadsheet()

            makeDailySpreadsheet(justProjectNamesList, periodList, justCategoryNamesList)

            // if (csvType === csvTypes.import) {
            //     const myCsvFile = await parseCSVFile(fileSelect.files[0])
            //     //FIX: Move ad-hoc CSV Validation
            //     if (myCsvFile.rows[0].length !== 6) {
            //         console.error("imported CSV wrong number of columns")
            //         return
            //     }
            //     for (let i = 0; i <= myCsvFile.rows.length - 1; i++) {
            //         $('#spreadsheet1')["jexcel"]('insertRow', myCsvFile.rows[i], 1)
            //     }
            //     $('#spreadsheet1')["jexcel"]('deleteRow', 0)
            //     $('#spreadsheet1')["jexcel"]('deleteRow', 0)
            // }
        }
    }

    hideLoading()
    firstHalfRunning = false
    firstHalfSucessful = true

}

async function runSingleAction() {
    const actionSelectAction = document.getElementById("actionSelect").value
    const logDataBool = document.getElementById("actionSelectLogCheckbox").checked
    const actionListArray = []
    const actionListOptionsArray = [
        // eslint-disable-next-line no-unused-vars
        function(actionListArray) {return {action: actionSelectAction, logValue: `step: 1 action: ${actionSelectAction}`, myCsvFileObj: fileSelect.files[0], logDataBool}},
    ]

    for (let i = 0; i <= actionListOptionsArray.length - 1; i++) {
        actionListArray[i] = await runCurrentAction(actionListOptionsArray[i](actionListArray).action, actionListOptionsArray[i](actionListArray).logValue, actionListOptionsArray[i](actionListArray).myCsvFileObj, actionListOptionsArray[i](actionListArray).logDataBool)
        if (actionListArray[i].halt) {
            return {halt: actionListArray[i].halt}
        }
    }
    writeSeparatorToLog()
    return {halt: actionListArray[0].halt}
}

async function runFirstHalf() {

	const actionListArray = []
	const actionListOptionsArray = [
		function() {return {}},
        // eslint-disable-next-line no-unused-vars
		function(actionListArray) {return {action: actions.getProjects, logValue: "step: 1/8 action: getProjects", myCsvFileObj: "", logDataBool: false}}
	]

	// if (true) {
    for (let i = 1; i <= actionListOptionsArray.length - 1; i++) {
        actionListArray[i] = await runCurrentAction(actionListOptionsArray[i](actionListArray).action, actionListOptionsArray[i](actionListArray).logValue, actionListOptionsArray[i](actionListArray).myCsvFileObj, actionListOptionsArray[i](actionListArray).logDataBool)
        if (actionListArray[i].halt) {
            return {halt: actionListArray[i].halt}
        }

        if (i === 1) {
            projectList = actionListArray[i].conversion.data[0].data
        }
    }
	// } else {
	// 	logFakeAction("step: 1/8 action: getProjects", false)
	// 	projectList = getProjectList()
	// }

    categoryList = getCategoryList()
    userList = getUserList()
    userList = addGradeOrderToUserList(userList)
    // billingStatusList = getBillingStatusList()
    periodList = getPeriodList()
    return {halt: actionListArray[1].halt}
}

function getJustNames(inputArray, sort) {
    const temp = []
    for (let i = 0; i <= inputArray.length - 1; i++) {
        temp.push(inputArray[i].name)
    }
    if (sort) {
        return temp.sort()
    } else{
        return temp
    }
}

// function getCsvFilename() {
//     if (actionType === "sequenceweekly") {
//         return tableWeeklyFilename
//     }
//     if (actionType === "sequencedaily") {
//         return tableDailyFilename
//     }
// }

function makeWeeklySpreadsheet(projectList, periodList, categoryList) {

    const customDropDown1 = getCustomDropDown(projectList)
    const customDropDown2 = getCustomDropDown(periodList)
    const customDropDown3 = getCustomDropDown(categoryList)

    const myCols = [
        {editor: customDropDown1},
        {editor: customDropDown2},
        {editor: customDropDown3},
        {type: 'text'},
        {type: 'text'},
        {type: 'text'},
        {type: 'text'},
        {type: 'text'},
        {type: 'text'},
        {type: 'text'},
        {type: 'text'}
    ]
    const myColHeaders = ["client","period","category","nature of work","monday","tuesday","wednesday","thursday","friday","saturday","sunday"]
    const spreadsheetData = [
        ["","","","","","","","","","",""],
        ["","","","","","","","","","",""]
    ]
    const myColWidths = [200, 120, 120, 200, 80, 80, 80, 80, 80, 80, 80]

    makeSpreadsheet(spreadsheetData, myCols, myColHeaders, myColWidths, projectList, periodList, categoryList)
}

function makeDailySpreadsheet(projectList, periodList, categoryList) {

    const customDropDown1 = getCustomDropDown(projectList)
    const customDropDown2 = getCustomDropDown(periodList)
    const customDropDown3 = getCustomDropDown(categoryList)

    const myCols = [
        {editor: customDropDown1},
        {editor: customDropDown2},
        {editor: customDropDown3},
        {type: 'text'},
        {type: 'text'},
        {type: 'text'}
    ]
    const myColHeaders = ["client","period","category","nature of work","spent on (YYYY-MM-DD)","units"]
    const spreadsheetData = [
        ["","","","","",""],
        ["","","","","",""]
    ]
    const myColWidths = [200, 120, 120, 200, 180, 80]

    makeSpreadsheet(spreadsheetData, myCols, myColHeaders, myColWidths, projectList, periodList, categoryList)
}

function makeSpreadsheet(spreadsheetData, myCols, myColHeaders, myColWidths, projectList, periodList, categoryList) {

    const changed = function(obj, cell, val) {
        const cellName = $(cell).prop('id').split('-')

        if (cellName[0] === "0") {
            if (!(projectList.includes(val))) {
                $('#spreadsheet1')["jexcel"]('setStyle', 'A'+(Number(cellName[1])+1), 'background-color', 'yellow')
            } else {
                $('#spreadsheet1')["jexcel"]('setStyle', 'A'+(Number(cellName[1])+1), 'background-color', 'revert')
            }
        }
        if (cellName[0] === "1") {
            if (!(periodList.includes(val))) {
                $('#spreadsheet1')["jexcel"]('setStyle', 'B'+(Number(cellName[1])+1), 'background-color', 'yellow')
            } else {
                $('#spreadsheet1')["jexcel"]('setStyle', 'B'+(Number(cellName[1])+1), 'background-color', 'revert')
            }
        }
        if (cellName[0] === "2") {
            if (!(categoryList.includes(val))) {
                $('#spreadsheet1')["jexcel"]('setStyle', 'C'+(Number(cellName[1])+1), 'background-color', 'yellow')
            } else {
                $('#spreadsheet1')["jexcel"]('setStyle', 'C'+(Number(cellName[1])+1), 'background-color', 'revert')
            }
        }
    }

    $('#spreadsheet1')["jexcel"]({
        // csv: spreadsheetCsvFilename,
        // csvHeaders: true,
        data: spreadsheetData,
        colHeaders: myColHeaders,
        //tableOverflow: true,
        columns: myCols,
        colWidths: myColWidths,
        onchange: changed
    })
}

function getCustomDropDown(list) {
    return {
        // Methods
        // eslint-disable-next-line no-unused-vars
        closeEditor: function(cell, save) {
            // Get value
            const txt = $(cell).find(".editor").val()
            // Set visual value
            // @ts-ignore cannot assign txt
            $(cell).html(txt)
            // Close editor
            $(cell).removeClass("editor")
            // Save history
            return txt
        },
        openEditor: function(cell) {
            // Get current content
            let currentValue = $(cell).text()
            // Create the editor
            let editor = document.createElement("input")
            $(cell).html(editor)
            $(editor).prop("class", "editor")
            $(editor).val(currentValue)
            $(editor).on("blur", function() {
                $('#' + $.fn["jexcel"].current)["jexcel"]('closeEditor', $(cell), true)
            })
            // Create the instance of the plugin
            $(editor)
            //don't navigate away from the field on tab when selecting an item
            .on("keydown", function(event) {
                if (event.keyCode === $.ui.keyCode.TAB &&
                    $(this).autocomplete("instance").menu.active) {
                    event.preventDefault()
                }
            })
            .autocomplete({
                minLength: 0,
                source: list
            })
        },
        getValue: function(cell) {
            return $(cell).text()
        },
        setValue: function(cell, value) {
            $(cell).html(value)

            return true
        }
    }
}

async function runSpreadsheetDone() {

    const preReq = checkPreReq(preReqTypes.secondHalf, "", "", "", "", "", "", "")
    if (!preReq) {
        return
    }

    if (secondHalfNotFirstTime) {
        let msg = ""
        if (actionType === actionTypes.sequenceWeekly
            || actionType === actionTypes.sequenceDaily) {
            msg = "If time entries have already been entered,\nthis will enter time entries again."
        } else {
            msg = "Run again, are you sure?"
        }

        if (!(window.confirm(msg))) {
            return
        }
    }
    secondHalfNotFirstTime = true

    secondHalfRunning = true
    firstHalfSucessful = false

    // hideSpreadsheet()

    if (actionType === actionTypes.sequenceExportExtract
        || actionType === actionTypes.sequenceExportSummarizeUt
        || actionType === actionTypes.sequenceExportSummarizeCat
        || actionType === actionTypes.sequenceExportBreakdownCat
        || actionType === actionTypes.sequenceExportBreakdownClient) {
        showLoading()
        await runSecondHalf("")

        hideLoading()
        secondHalfRunning = false
        return
    }

    showLoading()

    let initCsvFileString

    if (csvType === csvTypes.import2) {
        writeToLog(`${fileSelect.files[0].name} CSV imported`, "log", logType.normal)

        initCsvFileString = fileSelect.files[0]

        //writeToLog(initCsvFileString.toString, "output", logType.normal)
        //console.log(initCsvFileString)
    } else {
        writeToLog("CSV created", "log", logType.normal)

        let initCsvFile = $('#spreadsheet1')["jexcel"]('getData')
        let headers = $('#spreadsheet1')["jexcel"]('getHeaders', false)
        // if (actionType = "sequenceweekly") {
        //     if (initCsvFile[0].length > 11) {
        //         initCsvFile = trimArray(initCsvFile, 11)
        //         headers = trimArray(headers, 11)
        //     }
        // } else if (actionType = "sequencedaily") {
        //     if (initCsvFile[0].length > 6) {
        //         initCsvFile = trimArray(initCsvFile, 6)
        //         headers = trimArray(headers, 6)
        //     }
        // }

        const temp = arrayToCsv(initCsvFile)
        let tempHeaders = `"${headers.join(`","`)}"`
        // FIXME: Do this properly: Get headers from validation collection
        tempHeaders = tempHeaders.replaceAll("nature of work","natureOfWork")
        tempHeaders = tempHeaders.replaceAll("spent on (YYYY-MM-DD)","spentOn")
        initCsvFileString = `${tempHeaders}\r\n${temp}`
        // const tempHeaders = arrayToCsv([headers])
        // initCsvFileString = `${tempHeaders}\r\n${temp}`
        console.log(initCsvFileString)

        writeToLog(initCsvFileString, "output", logType.normal)
        // console.log(initCsvFileString)
    }

    writeToLog("step: 2/8 action: csvInput completed successfully", "step", logType.finished)
    console.log("step: 2/8 action: csvInput completed successfully")

    await runSecondHalf(initCsvFileString)

    hideLoading()
    secondHalfRunning = false
}

// function trimArray(initCsvFile, numOfColumns) {
//     const temp = []

//     for (let i = 0; i <= initCsvFile.length - 1; i++) {
//         temp.push(initCsvFile[i].slice(0, numOfColumns))
//     }
//     return temp
// }

function arrayToCsv(initCsvFile) {
    const tempOuter = []

    for (let i = 0; i <= initCsvFile.length - 1; i++) {
        const tempInner = []
        tempInner.push(`"${initCsvFile[i].join(`","`)}"`)
        tempOuter.push(tempInner)
    }
    return tempOuter.join("\r\n")
}

async function runSecondHalf(initCsvFileString) {

    if (actionType === actionTypes.sequenceWeekly) {
        const actionListArray = []
        const actionListOptionsArray = [
            function() {return {}},
            function() {return {}},
            function() {return {}},
            // eslint-disable-next-line no-unused-vars
            function(actionListArray) {return {action: actions.convertNamesToIDs, logValue: "step: 3/8 action: name validation using convertNamesToIDs", myCsvFileObj: initCsvFileString, logDataBool: false}},
            // eslint-disable-next-line no-unused-vars
            function(actionListArray) {return {action: actions.convertWeekToDays, logValue: "step: 4/8 action: convertWeekToDays", myCsvFileObj: initCsvFileString, logDataBool: true}},
            function(actionListArray) {return {action: actions.convertNamesToIDs, logValue: "step: 5/8 action: convertNamesToIDs", myCsvFileObj: actionListArray[4].conversion.data[0].data, logDataBool: true}},
            // eslint-disable-next-line no-unused-vars
            function(actionListArray) {return {action: actions.getWorkPackages, logValue: "step: 6/8 action: getWorkPackages (please wait, this step takes a bit of time)", myCsvFileObj: "", logDataBool: false}},
            function(actionListArray) {return {action: actions.convertToWorkPackageIDs, logValue: "step: 7/8 action: convertToWorkPackageIDs", myCsvFileObj: actionListArray[5].conversion.data[0].data, logDataBool: true}},
            function(actionListArray) {return {action: actions.addTimeEntry, logValue: "step: 8/8 action: addTimeEntry", myCsvFileObj: actionListArray[7].conversion.data[0].data, logDataBool: false}}
        ]

        for (let i = 3; i <= actionListOptionsArray.length - 1; i++) {
            actionListArray[i] = await runCurrentAction(actionListOptionsArray[i](actionListArray).action, actionListOptionsArray[i](actionListArray).logValue, actionListOptionsArray[i](actionListArray).myCsvFileObj, actionListOptionsArray[i](actionListArray).logDataBool)
            if (actionListArray[i].halt) {
                return
            }

            if (i === 6) {
                workPackageList = actionListArray[i].conversion.data[0].data
            }
        }

        writeToLog("Sequence completed successfully", "step", logType.finished)
        console.log("Sequence completed successfully")
        writeSeparatorToLog()
    }
    if (actionType === actionTypes.sequenceDaily) {

        const actionListArray = []
        const actionListOptionsArray = [
            function() {return {}},
            function() {return {}},
            function() {return {}},
            // eslint-disable-next-line no-unused-vars
            function(actionListArray) {return {action: actions.convertNamesToIDs, logValue: "step: 3/6 action: convertNamesToIDs", myCsvFileObj: initCsvFileString, logDataBool: true}},
            // eslint-disable-next-line no-unused-vars
            function(actionListArray) {return {action: actions.getWorkPackages, logValue: "step: 4/6 action: getWorkPackages (please wait, this step takes a bit of time)", myCsvFileObj: "", logDataBool: false}},
            function(actionListArray) {return {action: actions.convertToWorkPackageIDs, logValue: "step: 5/6 action: convertToWorkPackageIDs", myCsvFileObj: actionListArray[3].conversion.data[0].data, logDataBool: true}},
            function(actionListArray) {return {action: actions.addTimeEntry, logValue: "step: 6/6 action: addTimeEntry", myCsvFileObj: actionListArray[5].conversion.data[0].data, logDataBool: false}}
        ]

        for (let i = 3; i <= actionListOptionsArray.length - 1; i++) {
            actionListArray[i] = await runCurrentAction(actionListOptionsArray[i](actionListArray).action, actionListOptionsArray[i](actionListArray).logValue, actionListOptionsArray[i](actionListArray).myCsvFileObj, actionListOptionsArray[i](actionListArray).logDataBool)
            if (actionListArray[i].halt) {
                return
            }

            if (i === 4) {
                workPackageList = actionListArray[i].conversion.data[0].data
            }
        }

        writeToLog("Sequence completed successfully", "step", logType.finished)
        console.log("Sequence completed successfully")
        writeSeparatorToLog()
    }
    if (actionType === actionTypes.sequenceExportExtract
        || actionType === actionTypes.sequenceExportSummarizeUt
        || actionType === actionTypes.sequenceExportSummarizeCat
        || actionType === actionTypes.sequenceExportBreakdownCat
        || actionType === actionTypes.sequenceExportBreakdownClient) {

        const actionListArray = []
        const actionListOptionsArray = []

        // eslint-disable-next-line no-unused-vars
        actionListOptionsArray[2] = function(actionListArray) {return {action: actions.getAllWorkPackages, logValue: "step: 2/4 action: getWorkPackages (please wait, this step takes a bit of time)", myCsvFileObj: "", logDataBool: false}}
        // eslint-disable-next-line no-unused-vars
        actionListOptionsArray[3] = function(actionListArray) {return {action: actions.getTimeEntries, logValue: "step: 3/4 action: getTimeEntries", myCsvFileObj: "", logDataBool: false}}
        // eslint-disable-next-line no-unused-vars
        actionListOptionsArray[4] = function(actionListArray) {return {action: actions.exportTimeEntries, logValue: "step: 4/4 action: exportTimeEntries", myCsvFileObj: "", logDataBool: true}}

        if (actionType === actionTypes.sequenceExportExtract) {
            actionListOptionsArray[5] = function(actionListArray) {return {action: actions.extractTimeSheets, logValue: "step: 5/4 action: extractTimeSheets", myCsvFileObj: actionListArray[4].conversion.data[0].data, logDataBool: false}}
            actionListOptionsArray[6] = function(actionListArray) {return {action: actions.condenseTimeSheets, logValue: "step: 6/4 action: condenseTimeSheets", myCsvFileObj: actionListArray[5].conversion.data, logDataBool: true}}
        }
        if (actionType === actionTypes.sequenceExportSummarizeUt) {
            actionListOptionsArray[5] = function(actionListArray) {return {action: actions.summarizeUtTimeEntries, logValue: "step: 6/4 action: tabulateUtTimeEntries", myCsvFileObj: actionListArray[4].conversion.data[0].data, logDataBool: true}}
        }
        if (actionType === actionTypes.sequenceExportSummarizeCat) {
            actionListOptionsArray[5] = function(actionListArray) {return {action: actions.summarizeCatTimeEntries, logValue: "step: 6/4 action: tabulateCatTimeEntries", myCsvFileObj: actionListArray[4].conversion.data[0].data, logDataBool: true}}
        }
        if (actionType === actionTypes.sequenceExportBreakdownCat) {
            actionListOptionsArray[5] = function(actionListArray) {return {action: actions.breakdownClientByCatTimeEntries, logValue: "step: 6/4 action: tabulateBreakdownClientByCatTimeEntries", myCsvFileObj: actionListArray[4].conversion.data[0].data, logDataBool: true}}
        }
        if (actionType === actionTypes.sequenceExportBreakdownClient) {
            actionListOptionsArray[5] = function(actionListArray) {return {action: actions.breakdownCatByClientTimeEntries, logValue: "step: 6/4 action: tabulateBreakdownCatByClientTimeEntries", myCsvFileObj: actionListArray[4].conversion.data[0].data, logDataBool: true}}
        }

        if (staticLists === false) {
            for (let i = 2; i <= 3; i++) {
                actionListArray[i] = await runCurrentAction(actionListOptionsArray[i](actionListArray).action, actionListOptionsArray[i](actionListArray).logValue, actionListOptionsArray[i](actionListArray).myCsvFileObj, actionListOptionsArray[i](actionListArray).logDataBool)
                if (actionListArray[i].halt) {
                    return
                }

                if (i === 2) {
                    workPackageList = actionListArray[i].conversion.data[0].data
                }
                if (i === 3) {
                    timeEntryList = actionListArray[i].conversion.data[0].data
                }
            }
        } else {
            logFakeAction("step: 2/4 action: getWorkPackages", true)
            workPackageList = JSON.parse(await readFileReaderAsync(workPackageListFileSelect.files[0]))

            logFakeAction("step: 3/4 action: getTimeEntries", true)
            timeEntryList = JSON.parse(await readFileReaderAsync(timeEntryListFileSelect.files[0]))
        }

        for (let i = 4; i <= actionListOptionsArray.length - 1; i++) {
            if (i === 5) {
                // if (actionType === actionTypes.sequenceExportExtract) {
                //     logFakeAction("step: 5/4 action: extractTimeSheets", true)
                // }
                if (actionType === actionTypes.sequenceExportSummarizeUt) {
                    logFakeAction("step: 5/4 action: summarizeUtTimeEntries", true)
                }
                if (actionType === actionTypes.sequenceExportSummarizeCat) {
                    logFakeAction("step: 5/4 action: summarizeCatTimeEntries", true)
                }
                if (actionType === actionTypes.sequenceExportBreakdownCat) {
                    logFakeAction("step: 5/4 action: breakdownClientByCatTimeEntries", true)
                }
                if (actionType === actionTypes.sequenceExportBreakdownClient) {
                    logFakeAction("step: 5/4 action: breakdownCatByClientTimeEntries", true)
                }
            }

            actionListArray[i] = await runCurrentAction(actionListOptionsArray[i](actionListArray).action, actionListOptionsArray[i](actionListArray).logValue, actionListOptionsArray[i](actionListArray).myCsvFileObj, actionListOptionsArray[i](actionListArray).logDataBool)
            if (actionListArray[i].halt) {
                return
            }
        }

        writeToLog("Sequence completed successfully", "step", logType.finished)
        console.log("Sequence completed successfully")
        writeSeparatorToLog()
    }
}

function logFakeAction(logValue, logMiddle) {
    console.log(logValue)
    writeToLog(logValue, "step", logType.step)

    if (logMiddle) {
        console.log("CSV loaded")
        writeToLog("CSV loaded", "log", logType.normal)
    }

    console.log(`${logValue} completed successfully`)
    writeToLog(`${logValue} completed successfully`, "step", logType.finished)
}

async function runCurrentAction(action, logValue, myCsvFileObj, logDataBool) {
    const actionOptions = getActionOptions(action)
    const runOneActionParamsObj = actionOptions
    runOneActionParamsObj.action = action
    runOneActionParamsObj.logValue = logValue
    runOneActionParamsObj.myCsvFileObj = myCsvFileObj
    runOneActionParamsObj.logDataBool = logDataBool
    runOneActionParamsObj.billingStatusList = billingStatusList

    // runOneAction params: action, logValue, myCsvFileObj, hasWeb, hasConversion, hasFile, logDataBool, apiKey, wpConvertUser, projectList, categoryList, workPackageList, timeEntryList, userList, billingStatusList
    const currentStep = await runOneAction(runOneActionParamsObj)
    return currentStep
}

function getActionOptions(action) {
    // return params: hasWeb, hasConversion, hasFile, apiKey, wpConvertUser, projectList, categoryList, workPackageList, timeEntryList, userList, billingStatusList
    const returnObj = {}
    if (action === actions.updateWorkPackage
        || action === actions.updateTimeEntry
        || action === actions.addMembership
        || action === actions.addWorkPackage
        || action === actions.addProject
        || action === actions.addTimeEntry) {
        returnObj.hasWeb = true
        returnObj.hasConversion = false
        returnObj.hasFile = true
        returnObj.apiKey = apiKey
        // if (action === actions.updateTimeEntry) {
        //     returnObj.billingStatusList = billingStatusList
        // }
        return returnObj
    } else if (action === actions.convertToWorkPackageIDs
        || action === actions.convertNamesToIDs
        || action === actions.convertMembershipNamesToIDs
        || action === actions.convertWeekToDays
        || action === actions.exportTimeEntries
        || action === actions.extractTimeSheets
        || action === actions.condenseTimeSheets
        || action === actions.summarizeUtTimeEntries
        || action === actions.summarizeCatTimeEntries
        || action === actions.breakdownClientByCatTimeEntries
        || action === actions.breakdownCatByClientTimeEntries) {
        returnObj.hasWeb = false
        returnObj.hasConversion = true
        returnObj.hasFile = true
        if (action === actions.exportTimeEntries) {
            returnObj.hasFile = false
        }
        if (action === actions.convertToWorkPackageIDs
            || action === actions.extractTimeSheets) {
            returnObj.wpConvertUser = wpConvertUser
        }
        if (action === actions.summarizeCatTimeEntries
            || action === actions.breakdownClientByCatTimeEntries
            || action === actions.breakdownCatByClientTimeEntries) {
            returnObj.billingStatusReportFilter = billingStatusReportFilter
        }
        if (action === actions.convertToWorkPackageIDs
            || action === actions.convertNamesToIDs
            || action === actions.convertMembershipNamesToIDs
            || action === actions.exportTimeEntries
            || action === actions.summarizeUtTimeEntries
            || action === actions.summarizeCatTimeEntries
            || action === actions.breakdownClientByCatTimeEntries
            || action === actions.breakdownCatByClientTimeEntries) {
            returnObj.projectList = projectList
        }
        if (action === actions.convertNamesToIDs
            || action === actions.exportTimeEntries
            || action === actions.summarizeCatTimeEntries
            || action === actions.breakdownClientByCatTimeEntries
            || action === actions.breakdownCatByClientTimeEntries) {
            returnObj.categoryList = categoryList
        }
        if (action === actions.convertToWorkPackageIDs
            || action === actions.exportTimeEntries) {
            returnObj.workPackageList = workPackageList
        }
        if (actions.exportTimeEntries) {
            returnObj.timeEntryList = timeEntryList
        }
        if (action === actions.exportTimeEntries
            || action === actions.extractTimeSheets
            || action === actions.summarizeUtTimeEntries
            || action === actions.summarizeCatTimeEntries
            || action === actions.breakdownClientByCatTimeEntries
            || action === actions.breakdownCatByClientTimeEntries) {
            returnObj.userList = userList
        }
        return returnObj
    } else if (action === actions.getProjects
        || action === actions.getWorkPackages
        || action === actions.getAllWorkPackages
        || action === actions.getTimeEntries) {
        returnObj.hasWeb = true
        returnObj.hasConversion = true
        returnObj.hasFile = false
        returnObj.apiKey = apiKey
        if (action === actions.getWorkPackages) {
            returnObj.wpConvertUser = wpConvertUser
        }
        return returnObj
    } else {
		throw new RangeError(`Invalid action: "${action}"`)
    }
}

async function runOneAction(paramsObj) {
    // params: action, logValue, myCsvFileObj, hasWeb, hasConversion, hasFile, logDataBool, apiKey, wpConvertUser, projectList, categoryList, workPackageList, timeEntryList, userList, billingStatusList
    writeToLog(paramsObj.logValue, "step", logType.step)
    console.log(paramsObj.logValue)
    const myCsvFile = await checkGetFile(paramsObj.action, paramsObj.hasFile, paramsObj.myCsvFileObj)
    // doActionAsync params: action,apiKey,wpConvertUser,rows,headerRow,weekBegin,dateEndPeriod,projectList,categoryList,workPackageList,timeEntryList,userList,billingStatusList
    const doActionAsyncParamsObj = paramsObj
    doActionAsyncParamsObj.rows = myCsvFile.rows
    doActionAsyncParamsObj.headerRow = myCsvFile.headerRow
    doActionAsyncParamsObj.weekBegin = weekBegin
    doActionAsyncParamsObj.dateEndPeriod = dateEndPeriod
    doActionAsyncParamsObj.numberOfWeeks = numberOfWeeks
    doActionAsyncParamsObj.filterToOneUserBool = filterToOneUserBool

    const currentStep = await doActionAsync(doActionAsyncParamsObj)
    if (paramsObj.hasWeb) {
        logWebResults(currentStep.web)
        if (webErrorsPresent(currentStep.web)) {
            writeSeparatorToLog()
            currentStep.halt = true
            return currentStep
        }
    }
    if (paramsObj.hasConversion) {
        if (conversionErrorsPresent(currentStep.conversion)) {
            logConversionErrors(currentStep.conversion)
            writeSeparatorToLog()
            currentStep.halt = true
            return currentStep
        }
    }
    if (paramsObj.logDataBool) {
        logData(paramsObj.action, currentStep)
    }
    writeToLog(`${paramsObj.logValue} completed successfully`, "step", logType.finished)
    console.log(`${paramsObj.logValue} completed successfully`)

    currentStep.halt = false
    return currentStep
}

async function checkGetFile(action, hasFile, myCsvFileObj) {
    if (hasFile) {
        if (action === actions.condenseTimeSheets) {
            return {rows: myCsvFileObj, headerRow: []}
        } else {
            const myCsvFile = await parseCSVFile(myCsvFileObj)
            return myCsvFile
        }
    } else {
        return {rows: [], headerRow: []}
    }
}

async function parseCSVFile(myCsvFileObj) {

    const csvData = await getPapaPromise(myCsvFileObj)

    //TODO: Validate CSV data here

    //writeToLog(`${fileSelect.files[0].name} CSV loaded`, "log", logType.normal)
    //console.log(`${fileSelect.files[0].name} CSV loaded`)
    writeToLog("CSV loaded", "log", logType.normal)
    console.log("CSV loaded")

    const headerRow = csvData.meta.fields
    const rows = csvData.data

    return {rows: rows, headerRow: headerRow}
}

async function getPapaPromise(content) {
    return new Promise(function (complete, error) {
        Papa.parse(content, {complete, error, skipEmptyLines: "greedy", header: true})
    })
}

async function readFileReaderAsync(file) {
    return new Promise(function (resolve, reject) {
        let reader = new FileReader()
        reader.onload = function() {
            resolve(reader.result)
        }
        reader.onerror = reject
        reader.readAsText(file)
    })
}

function getSelectedRadioButtonValue(radioGroupName) {
    const radioGroup = document.getElementsByName(radioGroupName)
    for (let i = 0; i <= radioGroup.length - 1; i++) {
        if (radioGroup[i].checked) {
            return radioGroup[i].value
        }
    }
}

function conversionErrorsPresent(resultArray) {
    //FIXME: Use array.every
    for (let i = 0; i <= resultArray.errors.length - 1; i++) {
        if (resultArray.errors[i].message !== "") {
            return true
        }
    }
    return false
}

function logWebResults(resultList) {

    for (let i = 0; i <= resultList.length - 1; i++) {
        const element = resultList[i]

        for (let j = 0; j <= element.prelog.length - 1; j++) {
            console.log(element.prefix, element.prelog[j])
            writeToLog(`${element.prefix} ${element.prelog[j]}`, "output", logType.normal)
        }
        if (typeof element.errorType !== "undefined") {
            switch (element.errorType) {
                case webErrorTypes.httpWithJSON:
                    console.log(element.prefix, element.status)
                    console.error(element.error)
                    writeToLog(`${element.prefix} ${element.status}\nerror: ${element.error.errorIdentifier.replaceAll("urn:openproject-org:api:v3:errors:","")} - ${element.error.message}`, "error", logType.error)
                    break
                case webErrorTypes.http:
                    console.log(element.prefix, element.status)
                    writeToLog(`${element.prefix} ${element.status}`, "error", logType.error)
                    break
                case webErrorTypes.network:
                    console.log(element.prefix)
                    console.error(element.error)
                    // writeToLog(`${element.prefix}\nerror: ${element.error}`, "error", logType.error)
                    // FIXME: Fix this properly, not status
                    writeToLog(`${element.prefix} ${element.status}\nerror: ${element.error}`, "error", logType.error)
                    break
                case webErrorTypes.unknown:
                    console.log(element.prefix)
                    console.error(element.error)
                    // writeToLog(`${element.prefix}\nerror: ${element.error}`, "error", logType.error)
                    // FIXME: Fix this properly, not status
                    writeToLog(`${element.prefix} ${element.status}\nerror: ${element.error}`, "error", logType.error)
                    break
                default:
                    break
            }
        } else {
            console.log(element.prefix, element.status)
            writeToLog(`${element.prefix} ${element.status}`, "output", logType.normal)
            ////console.log(element.prefix, element.data.id)
        }
    }
    // ReferenceError: logTextBox is not defined
    // resultList.forEach(function (element) {
    // 	if (typeof element.error !== "undefined") {
    // 		console.log(element.prefix, element.status)
    // 		console.error(element.error)
    //      writeToLog(`${element.prefix} ${element.status}`, "output", logType.normal)
    //      writeToLog(`${element.error}`, "error", logType.error)
    // 	} else {
    // 		console.log(element.prefix, element.status)
    //      writeToLog(`${element.prefix} ${element.status}`, "output", logType.normal)
    // 		////console.log(element.prefix, element.data.id)
    // 	}
    // })
}

function logConversionErrors(resultArray) {
    for (let i = 0; i <= resultArray.errors.length - 1; i++) {
        if (resultArray.errors[i].message !== "") {
            console.error(resultArray.errors[i].message)
            writeToLog(`${resultArray.errors[i].message}`, "error", logType.error)
        }
    }
    if (typeof resultArray.errors[0].csv1 !== "undefined") {
        console.error(resultArray.errors[0].csv1)
        writeToLog(`${resultArray.errors[0].csv1}`, "error", logType.error)
    }
    if (typeof resultArray.errors[0].csv2 !== "undefined") {
        console.error(resultArray.errors[0].csv2)
        writeToLog(`${resultArray.errors[0].csv2}`, "error", logType.error)
    }
    // ReferenceError: logTextBox is not defined
    // resultArray.errors.forEach(function (element) {
    // 	if (element !== "") {
    // 		console.error(element)
    //      writeToLog(`${element}`, "error", logType.error)
    // 	}
    // })
}

function logData(action, currentStep) {
    if (action === actions.getProjects
        || action === actions.getWorkPackages
        || action === actions.getAllWorkPackages
        || action === actions.getTimeEntries) {
        writeToLog(`${JSON.stringify(currentStep.conversion.data[0].data)}`, "output", logType.normal)
        console.log(currentStep.conversion.data[0].data)
        return
    }
    if (action === actions.convertToWorkPackageIDs
        || action === actions.convertNamesToIDs
        || action === actions.convertMembershipNamesToIDs
        || action === actions.convertWeekToDays
        || action === actions.exportTimeEntries) {
        writeToLog(`${currentStep.conversion.data[0].data}`, "output", logType.normal)
        console.log(currentStep.conversion.data[0].data)
        return
    }
    if (action === actions.extractTimeSheets
        || action === actions.condenseTimeSheets
        || action === actions.summarizeUtTimeEntries
        || action === actions.summarizeCatTimeEntries
        || action === actions.breakdownClientByCatTimeEntries
        || action === actions.breakdownCatByClientTimeEntries) {
        for (let i = 0; i <= currentStep.conversion.data.length - 1; i++) {
            if (action === actions.extractTimeSheets) {
                writeToLog(`${currentStep.conversion.data[i].name}`, "output", logType.normal)
                console.log(`${currentStep.conversion.data[i].name}`)
                for (let j = 0; j <= currentStep.conversion.data[i].data.length - 1; j++) {
                    writeToLog(`${currentStep.conversion.data[i].data[j].name}\n${currentStep.conversion.data[i].data[j].csv}`, "output", logType.normal)
                    console.log(`${currentStep.conversion.data[i].data[j].name}\n${currentStep.conversion.data[i].data[j].csv}`)
                }
            } else if (action === actions.condenseTimeSheets) {
                writeToLog(`${currentStep.conversion.data[i].name}`, "output", logType.normal)
                console.log(`${currentStep.conversion.data[i].name}`)
                for (let j = 0; j <= currentStep.conversion.data[i].data.length - 1; j++) {
                    writeToLog(`${currentStep.conversion.data[i].data[j].name}\n${currentStep.conversion.data[i].data[j].data}`, "output", logType.normal)
                    console.log(`${currentStep.conversion.data[i].data[j].name}\n${currentStep.conversion.data[i].data[j].data}`)
                }
            } else {
                writeToLog(`${currentStep.conversion.data[i].data}`, "output", logType.normal)
                console.log(currentStep.conversion.data[i].data)
            }
        }
        return
    }

    for (let i = 0; i <= currentStep.web.length - 1; i++) {
        writeToLog(`${JSON.stringify(currentStep.web[i].data)}`, "output", logType.normal)
        console.log(currentStep.web[i].data)
    }
}

function writeSeparatorToLog() {
    writeToLog("------------------------------------------------------------------------------------------------------------------------","",logType.step)
}

function checkPreReq(preReqType, user, apiKey, weekBegin, dateEndPeriod, numberOfWeeks, csvType, selectedFile) {
    if (preReqType === preReqTypes.sequence) {
        if (actionType === actionTypes.sequenceWeekly
            || actionType === actionTypes.sequenceDaily) {
            if (user === "-1") {
                writeToLog("error: No user selected", "error", logType.error)
                return false
            }
        }
        if (apiKey.length !== 64) {
            writeToLog("error: Invalid API Key", "error", logType.error)
            return false
        }
        if (actionType === actionTypes.sequenceWeekly
            || actionType === actionTypes.sequenceExportExtract
            || actionType === actionTypes.sequenceExportSummarizeUt
            || actionType === actionTypes.sequenceExportSummarizeCat
            || actionType === actionTypes.sequenceExportBreakdownCat
            || actionType === actionTypes.sequenceExportBreakdownClient) {
            if (!(dayjs(weekBegin, validDateFormats).isValid())) {
                writeToLog("error: Invalid date for week beginning", "error", logType.error)
                return false
            }
            // if (actionType === actionTypes.sequenceExportExtract) {
            //     const MONDAY = 1
            //     if (!(dayjs(weekBegin).day() === MONDAY)) {
            //         writeToLog(`error: Invalid date for week beginning\nMust be a Monday for "Export & extract from time entries"`, "error", logType.error)
            //         return false
            //     }
            // }
            if (actionType === actionTypes.sequenceExportSummarizeUt
                || actionType === actionTypes.sequenceExportSummarizeCat
                || actionType === actionTypes.sequenceExportBreakdownCat
                || actionType === actionTypes.sequenceExportBreakdownClient) {
                if (!(dayjs(dateEndPeriod, validDateFormats).isValid())) {
                    writeToLog("error: Invalid date for end of period", "error", logType.error)
                    return false
                }
            }
            if (actionType === actionTypes.sequenceExportExtract) {
                if (!(Number.isInteger(numberOfWeeks) && numberOfWeeks > 0)) {
                    writeToLog("error: Invalid value for number of weeks", "error", logType.error)
                    return false
                }
            }
        }
        if (actionType === actionTypes.sequenceWeekly
            || actionType === actionTypes.sequenceDaily) {
            if (csvType === csvTypes.import
                || csvType === csvTypes.import2) {
                if (typeof selectedFile === "undefined") {
                    writeToLog("error: Import CSV selected but no file selected for upload", "error", logType.error)
                    return false
                }
            }
        }
        return true
    }
    if (preReqType === preReqTypes.secondHalf) {
        if (firstHalfRunning === true) {
            return false
        }
        if (secondHalfRunning === true) {
            return false
        }
        if (actionType !== actionTypes.sequenceWeekly
            && actionType !== actionTypes.sequenceDaily) {
            if (firstHalfSucessful === false) {
                writeToLog(`error: Sucessfully run "Go 1" first`, "error", logType.error)
                return false
            }
        }
        return true
    }
    if (preReqType === preReqTypes.password) {
        if (user === "-1") {
            writeToLog("error: No user selected", "error", logType.error)
            return false
        } else {
            if (apiKey === "") {
                writeToLog("error: Invalid password", "error", logType.error)
                return false
            } else {
                return true
            }
        }
    }
    return false
}

function writeToLog(logValue, logFirstColumn, type) {
    const logElement = document.createElement("span")
    logElement.setAttribute("class", type)
    logElement.innerHTML = `<span class="cell"><!----></span><span class="cell content"><!----></span>`
    logElement.children[0].innerHTML = logFirstColumn.replaceAll("\n","<br>")
    logElement.children[1].innerHTML = logValue.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll("\n","<br>")
    logTextBox.appendChild(logElement)
    logTextBox.parentElement.scrollTop = logTextBox.parentElement.scrollHeight
}
