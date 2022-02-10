import { passwordToApiKey, passwordAndApiKeyMatch } from "./apiKeyListFile.js"
import {
	actionTypes,
	csvTypes,
	getDomElementValueById,
	getDomElementCheckedStateById,
	wpConvertUser,
	apiKey,
	checkPreReq,
	preReqTypes,
    runActions,
    runSpreadsheetDone
} from "./main.js"

const logTextBox = getDomElementChildById("log")

function addDomEventListeners() {
    getDomElementById("single").addEventListener("click", showHideUI)
    getDomElementById("sequenceWeekly").addEventListener("click", showHideUI)
    getDomElementById("sequenceDaily").addEventListener("click", showHideUI)
    getDomElementById("sequenceExportExtract").addEventListener("click", showHideUI)
    getDomElementById("sequenceExportSummarizeUt").addEventListener("click", showHideUI)
    getDomElementById("sequenceExportSummarizeCat").addEventListener("click", showHideUI)
    getDomElementById("sequenceExportBreakdownCat").addEventListener("click", showHideUI)
    getDomElementById("sequenceExportBreakdownClient").addEventListener("click", showHideUI)
    getDomElementById("staticListsCheckbox").addEventListener("change", showHideUI)
    getDomElementById("csvCreate").addEventListener("click", showHideUI)
    getDomElementById("csvImport").addEventListener("click", showHideUI)
    getDomElementById("csvImport2").addEventListener("click", showHideUI)
    getDomElementById("enterPassword").addEventListener("click", fillApiKey)
    getDomElementById("user").addEventListener("change", checkApiKeyYellow)
    getDomElementById("go1Button").addEventListener("click", runActions)
    getDomElementById("go2Button").addEventListener("click", runSpreadsheetDone)
}

function showHideUI() {

    const actionType = getSelectedRadioButtonValue("actionType")
    const csvType = getSelectedRadioButtonValue("csvType")
    const staticListsCheckboxChecked = getDomElementCheckedStateById("staticListsCheckbox")

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
    getDomElementById(element).style.display = value;
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
//     showHideUtil("spreadsheet1", "none")
// }

function showLoadingUI() {
    showHideUtil("loading", "inline")
}

function hideLoadingUI() {
    showHideUtil("loading", "none")
}

function getLocalStorage() {
    if (localStorage.getItem("userStore") !== null) {
        setDomElementValueById("user", localStorage.getItem("userStore"))
        setDomElementValueById("apiKeyBox", localStorage.getItem("apiKeyStore"))
    }
}

function setLocalStorage() {
    localStorage.setItem("userStore", wpConvertUser)
    localStorage.setItem("apiKeyStore", apiKey)
}

function apiKeyMakeYellow() {
    setDomElementBackgroundColorById("apiKeyBox", "yellow")
}

function apiKeyRemoveYellow() {
    setDomElementBackgroundColorById("apiKeyBox", "revert")
}

function checkApiKeyYellow() {
    const user = getDomElementValueById("user")
    const apiKeyRetrived = getDomElementValueById("apiKeyBox")
    if (passwordAndApiKeyMatch(user, apiKeyRetrived)) {
        apiKeyRemoveYellow()
    } else {
        apiKeyMakeYellow()
    }
}

function fillApiKey() {
    const user = getDomElementValueById("user")
    const password = getDomElementValueById("passwordBox")
    const apiKeyRetrived = passwordToApiKey(user, password)

    const preReq = checkPreReq(preReqTypes.password, user, apiKeyRetrived, "", "", "", "", "")
    if (preReq) {
        setDomElementValueById("apiKeyBox", apiKeyRetrived)
    }
    checkApiKeyYellow()
}

function makeWeeklySpreadsheet(projectList, periodList, categoryList) {

    const customDropDown1 = getCustomDropDown(projectList)
    const customDropDown2 = getCustomDropDown(periodList)
    const customDropDown3 = getCustomDropDown(categoryList)

    const myCols = [
        {editor: customDropDown1},
        {editor: customDropDown2},
        {editor: customDropDown3},
        {type: "text"},
        {type: "text"},
        {type: "text"},
        {type: "text"},
        {type: "text"},
        {type: "text"},
        {type: "text"},
        {type: "text"}
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
        {type: "text"},
        {type: "text"},
        {type: "text"}
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
        const cellName = $(cell).prop("id").split("-")

        if (cellName[0] === "0") {
            if (!(projectList.includes(val))) {
                $("#spreadsheet1").jexcel("setStyle", "A"+(Number(cellName[1])+1), "background-color", "yellow")
            } else {
                $("#spreadsheet1").jexcel("setStyle", "A"+(Number(cellName[1])+1), "background-color", "revert")
            }
        }
        if (cellName[0] === "1") {
            if (!(periodList.includes(val))) {
                $("#spreadsheet1").jexcel("setStyle", "B"+(Number(cellName[1])+1), "background-color", "yellow")
            } else {
                $("#spreadsheet1").jexcel("setStyle", "B"+(Number(cellName[1])+1), "background-color", "revert")
            }
        }
        if (cellName[0] === "2") {
            if (!(categoryList.includes(val))) {
                $("#spreadsheet1").jexcel("setStyle", "C"+(Number(cellName[1])+1), "background-color", "yellow")
            } else {
                $("#spreadsheet1").jexcel("setStyle", "C"+(Number(cellName[1])+1), "background-color", "revert")
            }
        }
    }

    $("#spreadsheet1").jexcel({
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
                $("#" + $.fn.jexcel.current).jexcel("closeEditor", $(cell), true)
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

function getSpreedsheetData() {
    return $("#spreadsheet1").jexcel("getData")
}

function getSpreedsheetHeaders() {
    return $("#spreadsheet1").jexcel("getHeaders", false)
}

function getSelectedRadioButtonValue(radioGroupName) {
    const radioGroup = document.getElementsByName(radioGroupName)
    for (let i = 0; i <= radioGroup.length - 1; i++) {
        if (radioGroup[i].checked) {
            return radioGroup[i].value
        }
    }
}

function displayAlert(msg) {
    return window.confirm(msg)
}

function setDomElementBackgroundColorById(eleName, val) {
    getDomElementById(eleName).style.backgroundColor = val
}

function getDomElementChildById(eleName) {
    return getDomElementById(eleName).children[0]
}

function setDomElementValueById(eleName, val) {
    getDomElementById(eleName).value = val
}

function getDomElementById(eleName) {
    return document.getElementById(eleName)
}

function writeToLogDom(logValue, logFirstColumn, type) {
    const logElement = document.createElement("span")
    logElement.setAttribute("class", type)
    logElement.innerHTML = `<span class="cell"><!----></span><span class="cell content"><!----></span>`
    logElement.children[0].innerHTML = logFirstColumn.replaceAll("\n","<br>")
    logElement.children[1].innerHTML = logValue.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll("\n","<br>")
    logTextBox.appendChild(logElement)
    logTextBox.parentElement.scrollTop = logTextBox.parentElement.scrollHeight
}

export { addDomEventListeners, showSpreadsheet, showLoadingUI, hideLoadingUI, getLocalStorage, setLocalStorage, checkApiKeyYellow, makeWeeklySpreadsheet, makeDailySpreadsheet, makeSpreadsheet, getSpreedsheetData, getSpreedsheetHeaders, getSelectedRadioButtonValue, displayAlert, getDomElementById, writeToLogDom }