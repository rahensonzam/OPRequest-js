// import $ from "./libs/jquery/jquery.module.js"
// import * as Papa from "./libs/papaparse/papaparse.js"

// const got = require('got')
// const papa = require('papaparse')
// const fs = require('fs').promises

const hostURL = "http://127.0.0.1:9999"
const apiURL = "/api/v3"
const baseURL = `${hostURL}${apiURL}`
// const apiKey = "secretkey"
// const wpConvertUser = 10

// const myCsvFile = "csv.csv"

// const workPackageListFilename = "workpackages_short_list.json"
// const projectListFilename = "projects_short_list.json"
// const categoryListFilename = "categories_short_list.json"

const actions = {
	updateWorkPackage: "updateWorkPackage",
	updateTimeEntry: "updateTimeEntry",
	deleteTimeEntry: "deleteTimeEntry",
	addMembership: "addMembership",
	addWorkPackage: "addWorkPackage",
	addProject: "addProject",
	addTimeEntry: "addTimeEntry",
	getProjects: "getProjects",
	getWorkPackages: "getWorkPackages",
	getAllWorkPackages: "getAllWorkPackages",
	getTimeEntries: "getTimeEntries",
	exportTimeEntries: "exportTimeEntries",
	extractTimeSheets: "extractTimeSheets",
	condenseTimeSheets: "condenseTimeSheets",
	summarizeUtTimeEntries: "summarizeUtTimeEntries",
	summarizeCatTimeEntries: "summarizeCatTimeEntries",
	breakdownClientByCatTimeEntries: "breakdownClientByCatTimeEntries",
	tabulateUtTimeEntries: "tabulateUtTimeEntries",
	tabulateCatTimeEntries: "tabulateCatTimeEntries",
	tabulateBreakdownTimeEntries: "tabulateBreakdownTimeEntries",
	convertToWorkPackageIDs: "convertToWorkPackageIDs",
	convertNamesToIDs: "convertNamesToIDs",
	convertMembershipNamesToIDs: "convertMembershipNamesToIDs",
	convertWeekToDays: "convertWeekToDays"
}

// const activeAction = actions.addTimeEntry

const daysOfWeek = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday",
]

const webErrorTypes = {
	httpWithJSON: "httpWithJSON",
	http: "http",
	network: "network",
	unknown: "unknown"
}

const custom = {
	billingStatus: "customField5",
	feeNoteNumber: "customField6"
}

// const CSV = {
// 	updateWorkPackage: {
// 		workPackageID: 0,
// 		subject: 1,
// 		user: 2
// 	},
// 	updateTimeEntry: {
// 		timeEntryID: 0,
// 		workPackageID: 1,
// 		activity: 2,
// 		comment: 3,
// 		spentOn: 4,
// 		units: 5
// 	},
// 	addMembership: {
// 		project: 0,
// 		user: 1,
// 		role: 2
// 	},
// 	addWorkPackage: {
// 		project: 0,
// 		subject: 1,
// 		user: 2
// 	},
// 	addProject: {
// 		identifier: 0,
// 		name: 1
// 	},
// 	addTimeEntry: {
// 		workPackageID: 0,
// 		activity: 1,
// 		comment: 2,
// 		spentOn: 3,
// 		units: 4
// 	},
// 	convertToWorkPackageIDs: {
// 		client: 0,
// 		period: 1,
// 		category: 2,
// 		natureOfWork: 3,
// 		spentOn: 4,
// 		units: 5
// 	},
// 	convertNamesToIDs: {
// 		client: 0,
// 		period: 1,
// 		category: 2,
// 		natureOfWork: 3,
// 		spentOn: 4,
// 		units: 5
// 	},
// 	convertMembershipNamesToIDs: {
// 		project: 0,
// 		user: 1,
// 		role: 2
// 	},
// 	convertWeekToDays: {
// 		client: 0,
// 		period: 1,
// 		category: 2,
// 		natureOfWork: 3,
// 		monday: 4,
// 		tuesday: 5,
// 		wednesday: 6,
// 		thursday: 7,
// 		friday: 8,
// 		saturday: 9,
// 		sunday: 10,
// 	}
// }

// main()

// async function main() {

// 	await doActionAsync(activeAction, myCsvFile)
// 	console.log("All done")
// }

async function doActionAsync(paramsObj) {
	// params: action,apiKey,wpConvertUser,rows,headerRow,weekBegin,dateEndPeriod,projectList,categoryList,workPackageList,timeEntryList,userList

	const action = checkIfPropertyExists(paramsObj, "action")
	const apiKey = checkIfPropertyExists(paramsObj, "apiKey")
	const wpConvertUser = checkIfPropertyExists(paramsObj, "wpConvertUser")
	const rows = checkIfPropertyExists(paramsObj, "rows")
	const headerRow = checkIfPropertyExists(paramsObj, "headerRow")
	const weekBegin = checkIfPropertyExists(paramsObj, "weekBegin")
	const dateEndPeriod = checkIfPropertyExists(paramsObj, "dateEndPeriod")
	const projectList = checkIfPropertyExists(paramsObj, "projectList")
	const categoryList = checkIfPropertyExists(paramsObj, "categoryList")
	const workPackageList = checkIfPropertyExists(paramsObj, "workPackageList")
	const timeEntryList = checkIfPropertyExists(paramsObj, "timeEntryList")
	const userList = checkIfPropertyExists(paramsObj, "userList")
	const billingStatusList = checkIfPropertyExists(paramsObj, "billingStatusList")

	// const workPackageList = await getListFileAsync(action, workPackageListFilename)
	// const projectList = await getListFileAsync(action, projectListFilename)
	// const categoryList = await getListFileAsync(action, categoryListFilename)

	const isValid = validateCSV(action, rows, headerRow)
	if (action === actions.updateWorkPackage
		|| action === actions.updateTimeEntry
		|| action === actions.deleteTimeEntry
		|| action === actions.addMembership
		|| action === actions.addWorkPackage
		|| action === actions.addProject
		|| action === actions.addTimeEntry) {
		if (typeof isValid[0].errorType !== "undefined") {
			return {web: isValid}
		}
	}
	if (action === actions.convertWeekToDays
		|| action === actions.convertNamesToIDs) {
		if (isValid.errors[0].message !== "") {
			return {conversion: isValid}
		}
	}

	const convertedCSVResults = []

	const taskList = []

	let numOfPages
	if (action === actions.getWorkPackages
		|| action === actions.getAllWorkPackages
		|| action === actions.getTimeEntries) {
		const result = await retrievePageCountAsync(action, apiKey, wpConvertUser)
		// logWebResults(result)
		// FIXME: Use array.every
		// if (!(result.every(function (element) {element.error === ""}))) {
		// above returns false regardless
		if (webErrorsPresent(result)) {
			return {web: result, conversion: {}}
		}
		// FIXME: pageSize is hardcoded as 100
		numOfPages = Math.ceil(Number(result[0].data["total"]) / 100)
	}

	const count = setCount(action, rows, numOfPages, timeEntryList)

	for (let rowIndex = count.start; rowIndex <= count.end; rowIndex++) {
		const row = rows[rowIndex]
		if (action === actions.updateWorkPackage) {
			taskList.push(doCurrentActionAsync(action, row, billingStatusList, "PATCH", true, apiKey, "workPackageID", row.workPackageID))
		} else if (action === actions.updateTimeEntry) {
			taskList.push(doCurrentActionAsync(action, row, billingStatusList, "PATCH", false, apiKey, "timeEntryID", row.timeEntryID))
			// } else if (action === actions.deleteTimeEntry) {
			// 	taskList.push(doCurrentActionAsync(action, row, billingStatusList, "DELETE", false, apiKey, "timeEntryID", row.timeEntryID))
		} else if (action === actions.addMembership) {
			taskList.push(doCurrentActionAsync(action, row, billingStatusList, "POST", false, apiKey, "project", row.project))
		} else if (action === actions.addWorkPackage) {
			taskList.push(doCurrentActionAsync(action, row, billingStatusList, "POST", false, apiKey, "project", row.project))
		} else if (action === actions.addProject) {
			taskList.push(doCurrentActionAsync(action, row, billingStatusList, "POST", false, apiKey, "name", row.name))
		} else if (action === actions.addTimeEntry) {
			taskList.push(doCurrentActionAsync(action, row, billingStatusList, "POST", false, apiKey, "workPackageID", row.workPackageID))
		} else if (action === actions.convertToWorkPackageIDs) {
			convertedCSVResults.push(convertCsvAction({action, row, rowIndex, wpConvertUser, projectList, workPackageList}))
		} else if (action === actions.convertNamesToIDs) {
			convertedCSVResults.push(convertCsvAction({action, row, rowIndex, projectList, categoryList}))
		} else if (action === actions.convertMembershipNamesToIDs) {
			convertedCSVResults.push(convertCsvAction({action, row, rowIndex, projectList}))
		} else if (action === actions.convertWeekToDays) {
			convertedCSVResults.push(convertCsvAction({action, row, weekBegin}))
		} else if (action === actions.exportTimeEntries) {
			convertedCSVResults.push(convertCsvAction({action, rowIndex, projectList, categoryList, workPackageList, timeEntryList, userList}))
		} else if (action === actions.extractTimeSheets) {
			convertedCSVResults.push(convertCsvAction({action, weekBegin, resultList: rows, userList}))
			// } else if (action === actions.condenseTimeSheets) {
			// 	convertedCSVResults.push(convertCsvAction({action, resultList: rows}))
		} else if (action === actions.summarizeUtTimeEntries) {
			convertedCSVResults.push(convertCsvAction({action, weekBegin, dateEndPeriod, resultList: rows, projectList, userList}))
		} else if (action === actions.summarizeCatTimeEntries) {
			convertedCSVResults.push(convertCsvAction({action, weekBegin, dateEndPeriod, resultList: rows, projectList, categoryList, userList}))
		} else if (action === actions.breakdownClientByCatTimeEntries) {
			convertedCSVResults.push(convertCsvAction({action, weekBegin, dateEndPeriod, resultList: rows, projectList, categoryList, userList}))
		} else if (action === actions.getProjects) {
			taskList.push(getCurrentListPartAAsync(action, rowIndex, "", "GET", apiKey, "pageNum", rowIndex))
		} else if (action === actions.getWorkPackages) {
			taskList.push(getCurrentListPartAAsync(action, rowIndex, wpConvertUser, "GET", apiKey, "pageNum", rowIndex))
		} else if (action === actions.getAllWorkPackages) {
			taskList.push(getCurrentListPartAAsync(action, rowIndex, "", "GET", apiKey, "pageNum", rowIndex))
		} else if (action === actions.getTimeEntries) {
			taskList.push(getCurrentListPartAAsync(action, rowIndex, "", "GET", apiKey, "pageNum", rowIndex))
		} else {
			console.log("Invalid action")
		}
	}

	if (action === actions.convertToWorkPackageIDs
		|| action === actions.convertNamesToIDs
		|| action === actions.convertMembershipNamesToIDs
		|| action === actions.convertWeekToDays
		|| action === actions.exportTimeEntries) {
		const outputObj = await convertResultsToCsv(convertedCSVResults)
		return {conversion: outputObj}
	}

	if (action === actions.summarizeUtTimeEntries
		|| action === actions.summarizeCatTimeEntries) {
		const outputObj = await convertResultsToCsv(convertedCSVResults)
		return {conversion: outputObj}
	}

	if (action === actions.breakdownClientByCatTimeEntries) {
		const outputObj = await convertResultsToCsv2(convertedCSVResults)
		return {conversion: outputObj}
	}

	// if (action === actions.extractTimeSheets
	// 	|| action === actions.condenseTimeSheets
	// 	|| action === actions.summarizeUtTimeEntries) {
	if (action === actions.extractTimeSheets
		|| action === actions.condenseTimeSheets) {
		console.log("convertedCSVResults", convertedCSVResults)
		const coversionObj = await convertExtractResultsToCsv(action, convertedCSVResults)
		return {conversion: coversionObj}
	}

	const resultList = await Promise.all(taskList)

	// logWebResults(resultList)

	if (action === actions.getProjects
		|| action === actions.getWorkPackages
		|| action === actions.getAllWorkPackages
		|| action === actions.getTimeEntries) {
		for (let rowIndex = 0; rowIndex <= resultList.length - 1; rowIndex++) {
			convertedCSVResults.push(convertCsvAction({action, rowIndex, resultList}))
		}
		const coversionObj = convertResults(convertedCSVResults)
		return {web: resultList, conversion: coversionObj}
		// const outputJsonString = JSON.stringify(outputJson)
		// console.log(outputJsonString)
		// FIXME: Use array.every
		// if (convertedCSVResults.every(function (element) {element.errors === ""})) {
		// above returns false regardless
		// if (!(conversionErrorsPresent(convertedCSVResults))) {
		// 	await writeToFileAsync("outputJSON.json", outputJsonString)
		// }
	}

	return {web: resultList}

}

function setCount(action, rows, numOfPages, timeEntryList) {
	if (action === actions.getWorkPackages
		|| action === actions.getAllWorkPackages
		|| action === actions.getTimeEntries) {
		return {start: 1, end: numOfPages}
	} else if (action === actions.getProjects) {
		return {start: 0, end: 0}
	} else if (action === actions.exportTimeEntries) {
		return {start: 0, end: timeEntryList.length - 1}
	} else if (action === actions.extractTimeSheets
		|| action === actions.summarizeUtTimeEntries
		|| action === actions.summarizeCatTimeEntries
		|| action === actions.breakdownClientByCatTimeEntries) {
		return {start: 0, end: 0}
	} else {
		return {start: 0, end: rows.length - 1}
	}
}

function checkIfPropertyExists(obj, prop) {
	if (Object.prototype.hasOwnProperty.call(obj, prop)) {
		return obj[prop]
	}
}

function validateCSV(action, rows, headerRow) {
	if (action === actions.updateWorkPackage) {
		// return innerValidateCSVWeb(["workPackageID","subject","user"], headerRow, "PATCH")
		return innerValidateCSVWeb(["workPackageID"], headerRow, "PATCH")
	} else if (action === actions.updateTimeEntry) {
		// return innerValidateCSVWeb(["timeEntryID","workPackageID","activity","comment","spentOn","units"], headerRow, "PATCH")
		return innerValidateCSVWeb(["timeEntryID"], headerRow, "PATCH")
		// } else if (action === actions.deleteTimeEntry) {
	} else if (action === actions.addMembership) {
		return innerValidateCSVWeb(["project", "user", "role"], headerRow, "POST")
	} else if (action === actions.addWorkPackage) {
		return innerValidateCSVWeb(["project", "subject", "user"], headerRow, "POST")
	} else if (action === actions.addProject) {
		return innerValidateCSVWeb(["identifier", "name"], headerRow, "POST")
	} else if (action === actions.addTimeEntry) {
		return innerValidateCSVWeb(["workPackageID", "activity", "comment", "spentOn", "units"], headerRow, "POST")
	} else if (action === actions.convertToWorkPackageIDs) {
		console.log(`${action} CSV Validation not yet implemented`)
	} else if (action === actions.convertNamesToIDs) {
		// return innerValidateCSVConversion(["client","period","category","natureOfWork","spentOn","units"], headerRow)
		// FIXME:
		return innerValidateCSVConversion(["client", "period", "category", "natureOfWork"], headerRow)
	} else if (action === actions.convertMembershipNamesToIDs) {
		console.log(`${action} CSV Validation not yet implemented`)
	} else if (action === actions.convertWeekToDays) {
		return innerValidateCSVConversion(["client", "period", "category", "natureOfWork", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], headerRow)
	} else if (action === actions.exportTimeEntries) {
		console.log(`${action} CSV Validation not yet implemented`)
	} else if (action === actions.extractTimeSheets) {
		console.log(`${action} CSV Validation not yet implemented`)
		// } else if (action === actions.condenseTimeSheets) {
	} else if (action === actions.summarizeUtTimeEntries) {
		console.log(`${action} CSV Validation not yet implemented`)
	} else if (action === actions.summarizeCatTimeEntries) {
		console.log(`${action} CSV Validation not yet implemented`)
	} else if (action === actions.breakdownClientByCatTimeEntries) {
		console.log(`${action} CSV Validation not yet implemented`)
	} else if (action === actions.getProjects
		|| action === actions.getProjects
		|| action === actions.getWorkPackages
		|| action === actions.getAllWorkPackages
		|| action === actions.getTimeEntries) {
		// No CSV to be validated
	} else {
		console.log("Invalid action")
		return
	}
	return {}
	// convertToWorkPackageIDs: {
	// 	client: 0,
	// 	period: 1,
	// 	category: 2,
	// 	natureOfWork: 3,
	// 	spentOn: 4,
	// 	units: 5
	// },
	// convertNamesToIDs: {
	// 	client: 0,
	// 	period: 1,
	// 	category: 2,
	// 	natureOfWork: 3,
	// 	spentOn: 4,
	// 	units: 5
	// },
	// convertMembershipNamesToIDs: {
	// 	project: 0,
	// 	user: 1,
	// 	role: 2
	// },
	// convertWeekToDays: {
	// 	client: 0,
	// 	period: 1,
	// 	category: 2,
	// 	natureOfWork: 3,
	// 	monday: 4,
	// 	tuesday: 5,
	// 	wednesday: 6,
	// 	thursday: 7,
	// 	friday: 8,
	// 	saturday: 9,
	// 	sunday: 10,
	// }
}

function innerValidateCSVWeb(expected, headerRow, httpMethod) {

	for (let index = 0; index <= expected.length - 1; index++) {
		if (!(headerRow.includes(expected[index]))) {
			return [{
				errorType: webErrorTypes.unknown,
				status: "400 Bad Request",
				prelog: [],
				prefix: `Invalid CSV input: ${httpMethod}`,
				error: `"${expected[index]}" missing from CSV header\nExpected "${expected}" but got "${headerRow}"`
			}]
		}
	}
	return [{}]
}

function innerValidateCSVConversion(expected, headerRow) {

	for (let index = 0; index <= expected.length - 1; index++) {
		if (!(headerRow.includes(expected[index]))) {
			return {
				errors: [`Invalid CSV input\n"${expected[index]}" missing from CSV header\nExpected "${expected}" but got "${headerRow}"`]
			}
		}
	}
	return {errors: [""]}
}

// async function getListFileAsync(action, listFilename) {
// 	// conditionally assign a const
// 	if (action === actions.convertToWorkPackageIDs) {
//  		return JSON.parse(await fs.readFile(listFilename, "utf8"))
// 	}

// 	if (action === actions.convertNamesToIDs
// 		|| action === actions.convertMembershipNamesToIDs) {
// 		return JSON.parse(await fs.readFile(listFilename, "utf8"))
// 	}

// 	if (action === actions.convertNamesToIDs) {
// 		return JSON.parse(await fs.readFile(listFilename, "utf8"))
// 	}
// }

// function logWebResults(resultList) {
// 	for (const result of resultList) {
// 		if (typeof result.error !== "undefined") {
// 			console.log(result.prefix)
// 			console.log(result.error)
// 		} else {
// 			console.log(result.prefix, result.status)
// 			// console.log(result.prefix, result.data.id)
// 		}
// 	}
// }

async function convertExtractResultsToCsv(action, resultArray) {
	let temp = expandResults(resultArray)
	if (action === actions.extractTimeSheets) {
		temp = addEmptyDays(temp)
	}
	const temp3 = []
	for (let i = 0; i <= temp.length - 1; i++) {
		const outputCsv = Papa.unparse(temp[i].data, {quotes: true})
		temp3.push({name: temp[i].name, data: outputCsv})
	}
	const temp2 = extractErrors(resultArray)
	return {data: temp3, errors: temp2}
}

async function convertResultsToCsv(resultArray) {
	// logConversionErrors(resultArray)
	const temp = expandResults(resultArray)
	const temp3 = []
	for (let i = 0; i <= temp.length - 1; i++) {
		temp3.push(temp[i].data)
	}
	const outputCsv = Papa.unparse(temp3, {quotes: true})
	const temp2 = extractErrors(resultArray)
	return {data: [{data: outputCsv}], errors: temp2}
	// console.log(outputCsv)
}

async function convertResultsToCsv2(resultArray) {
	// logConversionErrors(resultArray)
	const temp = expandResults(resultArray)
	const outputData = []
	for (let i = 0; i <= temp.length - 1; i++) {
		const temp4 = temp[i].data
		const temp3 = []
		for (let j = 0; j <= temp4.length - 1; j++) {
			temp3.push(temp4[j].data)
		}
		const outputCsv = Papa.unparse(temp3, {quotes: true})
		outputData.push({name: temp[i].name, data: outputCsv})
	}
	const temp2 = extractErrors(resultArray)
	return {data: outputData, errors: temp2}
	// console.log(outputCsv)
}

function convertResults(resultArray) {
	// logConversionErrors(resultArray)
	const temp = expandResults(resultArray)
	const temp3 = []
	for (let i = 0; i <= temp.length - 1; i++) {
		temp3.push(temp[i].data)
	}
	const temp2 = extractErrors(resultArray)
	return {data: [{data: temp3}], errors: temp2}
}

// function logConversionErrors(resultArray) {
// 	resultArray.forEach(function (element) {
// 		if (element.errors !== "") {
// 			console.log(element.errors)
// 		}
// 	})
// // FIXME: Use array.every
// // if (resultArray.every(function (element) {element.errors === ""})) {
// // above returns false regardless
// if (!(conversionErrorsPresent(resultArray))) {
// 	const outputFilename = myCsvFile.replace(".csv","output.csv")
// 	await writeToFileAsync(outputFilename, outputCsv)
// }
// }

function addEmptyDays(resultArray) {
	const tempArray = resultArray
	for (let i = 0; i <= resultArray.length - 1; i++) {
		for (let j = 0; j <= resultArray[i].data.length - 1; j++) {
			for (let k = 0; k <= daysOfWeek.length - 1; k++) {
				if (typeof resultArray[i].data[j][daysOfWeek[k]] === "undefined") {
					tempArray[i].data[j][daysOfWeek[k]] = ""
				}
			}
		}
	}
	return tempArray
}

function expandResults(resultArray) {
	const temp = []
	for (let i = 0; i <= resultArray.length - 1; i++) {
		for (let j = 0; j <= resultArray[i].data.length - 1; j++) {
			// const temp2 = futherExpandResults(resultArray[i].data[j])
			// console.log("resultArray[i].data[j].data[0]", resultArray[i].data[j].data[0])
			temp.push(resultArray[i].data[j])
		}
	}
	return temp
}

// function futherExpandResults(resultArray) {
// 	const temp = []
// 	// 	for (let j = 0; j <= resultArray.data[].length - 1; j++) {
// 	// 		temp.push({data: resultArray[i].data[j]})
// 	// 	}
// 	// for (let i = 0; i <= resultArray.length - 1; i++) {
// 	// 	for (let j = 0; j <= resultArray[i].data.length - 1; j++) {
// 	// 		temp.push({data: resultArray[i].data[j]})
// 	// 	}
// 	// }
// 	return temp
// }

function extractErrors(resultArray) {
	const temp = []
	for (let j = 0; j <= resultArray.length - 1; j++) {
		temp.push(resultArray[j].errors)
	}
	return temp
}

function webErrorsPresent(resultList) {
	// FIXME: Use array.every
	for (let i = 0; i <= resultList.length - 1; i++) {
		if (typeof resultList[i].errorType !== "undefined") {
			return true
		}
	}
	return false
}

// async function checkFileExists(path) {
//     let result;

//     try {
//         await fs.access(path);
//         result = true;
//    } catch (err) {
//         result = false;
//    }

//     return result;
// }

// async function writeToFileAsync(outputFilename, outputObj) {
// 	if (!(await checkFileExists(outputFilename))) {
// 		try {
// 			await fs.writeFile(outputFilename, outputObj)
// 		} catch (error) {
// 			console.log(error)
// 		}
// 	} else {
// 		console.log("Error: File already exists")
// 	}
// }

async function retrievePageCountAsync(action, apiKey, wpConvertUser) {
	const task = []

	task.push(getCurrentListPartAAsync(action, 1, wpConvertUser, "GET", apiKey, "pageNum", 1))
	const result = await Promise.all(task)

	return result
}

function convertCsvAction(paramsObj) {
	// params: action, row, rowIndex, wpConvertUser, weekBegin, dateEndPeriod, resultList, projectList, categoryList, workPackageList, timeEntryList, userList
	const action = checkIfPropertyExists(paramsObj, "action")
	const row = checkIfPropertyExists(paramsObj, "row")
	const rowIndex = checkIfPropertyExists(paramsObj, "rowIndex")
	const wpConvertUser = checkIfPropertyExists(paramsObj, "wpConvertUser")
	const weekBegin = checkIfPropertyExists(paramsObj, "weekBegin")
	const dateEndPeriod = checkIfPropertyExists(paramsObj, "dateEndPeriod")
	const resultList = checkIfPropertyExists(paramsObj, "resultList")
	const projectList = checkIfPropertyExists(paramsObj, "projectList")
	const categoryList = checkIfPropertyExists(paramsObj, "categoryList")
	const workPackageList = checkIfPropertyExists(paramsObj, "workPackageList")
	const timeEntryList = checkIfPropertyExists(paramsObj, "timeEntryList")
	const userList = checkIfPropertyExists(paramsObj, "userList")

	const outputArray = []
	let error = ""
	let currentDate = weekBegin

	const workPackageIDs = []
	if (action === actions.convertToWorkPackageIDs) {
		const client = row.client
		const period = row.period

		for (const workPackageRow of workPackageList) {
			const project = workPackageRow["project"]
			const subject = workPackageRow["subject"]
			const assignee = workPackageRow["assignee"]
			if ((project == client)
				&& (subject == period)
				&& (assignee == wpConvertUser)) {
				workPackageIDs.push(workPackageRow.id)
			}
		}
	}

	const filteredSortedList = []
	if (action === actions.extractTimeSheets) {
		const tempList = filterListToNumberOfWeeks(resultList, currentDate, 1)
		filteredSortedList.push.apply(filteredSortedList, splitListByUser(tempList, userList))
		// console.log("filteredSortedList", filteredSortedList)
	}

	if (action === actions.summarizeUtTimeEntries) {
		const tempList = filterListToDateRange(resultList, currentDate, dateEndPeriod)
		filteredSortedList.push.apply(filteredSortedList, splitListByUser(tempList, userList))
		// console.log("filteredSortedList", filteredSortedList)
	}

	if (action === actions.summarizeCatTimeEntries) {
		const tempList = filterListToDateRange(resultList, currentDate, dateEndPeriod)
		filteredSortedList.push.apply(filteredSortedList, splitListByGrade(tempList, userList))
		// console.log("filteredSortedList", filteredSortedList)
	}

	if (action === actions.breakdownClientByCatTimeEntries) {
		const tempList = filterListToDateRange(resultList, currentDate, dateEndPeriod)
		filteredSortedList.push.apply(filteredSortedList, splitListByCategoryThenGrade(tempList, categoryList, userList))
		// console.log("filteredSortedList", filteredSortedList)
	}

	const uniqueValuesList = []
	// if (action === actions.condenseTimeEntries) {
	// 	uniqueValuesList.push.apply(uniqueValuesList, filterUniqueValues(resultList))
	// }

	const clientTypesList = []
	if (action === actions.summarizeUtTimeEntries) {
		clientTypesList.push.apply(clientTypesList, filterClientTypes(filteredSortedList, projectList))
	}

	const categoryTypesList = []
	if (action === actions.summarizeCatTimeEntries) {
		categoryTypesList.push.apply(categoryTypesList, filterCategoryTypes(filteredSortedList, categoryList))
	}

	const clientTypes2List = []
	if (action === actions.breakdownClientByCatTimeEntries) {
		clientTypes2List.push.apply(clientTypes2List, filterClientTypes2(filteredSortedList))
	}

	// check data for errors
	const conversionErrorResult = conversionErrorSelect(action, row, rowIndex, projectList, categoryList, workPackageIDs, filteredSortedList)
	if (conversionErrorResult !== false) {
		return conversionErrorResult
		// {data: outputArray, errors: error}
	}

	let retrievedListLength
	if (action === actions.getProjects
		|| action === actions.getWorkPackages
		|| action === actions.getAllWorkPackages
		|| action === actions.getTimeEntries) {
		retrievedListLength = resultList[rowIndex].data["_embedded"]["elements"].length - 1
	}

	const outputExt = []
	let outputExt2

	// FIXME: Teporary solution
	if (action !== actions.breakdownClientByCatTimeEntries) {
		// gather the data
		const count = setConversionCount(action, retrievedListLength, filteredSortedList.length - 1)
		for (let i = count.start; i <= count.end; i++) {
			const outputArrayDataRow = []

			outputArrayDataRow.push.apply(outputArrayDataRow, setOutputArrayData(action, row, rowIndex, i, currentDate, resultList, workPackageIDs, filteredSortedList, uniqueValuesList, clientTypesList, categoryTypesList, projectList, categoryList, workPackageList, timeEntryList, userList))
			// console.log(action)
			// console.log(action !== actions.extractTimeSheets
			// 	&& action !== actions.condenseTimeSheets
			// 	&& action !== actions.summarizeUtTimeEntries)
			// console.log("retrievedList", resultList[rowIndex].data["_embedded"]["elements"])
			// console.log("outputArrayDataRow", outputArrayDataRow)

			if (outputArrayDataRow.length !== 0) {
				if (action === actions.extractTimeSheets
					|| action === actions.summarizeUtTimeEntries
					|| action === actions.summarizeCatTimeEntries) {
					if (action === actions.extractTimeSheets
						|| action === actions.summarizeUtTimeEntries) {
						outputArrayDataRow.sort(compareAlphabetical)
						outputArrayDataRow.sort(compareMoveCurlyToBottom)
					}
					// if (action === actions.extractTimeSheets
					// 	|| action === actions.summarizeUtTimeEntries) {
					if (action === actions.extractTimeSheets) {
						outputExt.push({name: filteredSortedList[i].name, data: outputArrayDataRow})
					}
					if (action === actions.summarizeUtTimeEntries) {
						outputExt.push({name: filteredSortedList[i].name, data: outputArrayDataRow})
					}
					// if (action === actions.summarizeCatTimeEntries) {
					// 	outputExt.push({name: filteredSortedList[i].name, data: outputArrayDataRow})
					// }
					if (action === actions.summarizeCatTimeEntries) {
						outputExt.push({name: filteredSortedList[i].name, data: outputArrayDataRow})
					}
					// } else if (action === actions.condenseTimeSheets) {
					// 	outputArray.push({name: resultList[i].name, data: outputArrayDataRow})
				} else {
					outputArray.push({data: outputArrayDataRow[0]})
				}
			}
			if (action === actions.convertWeekToDays) {
				currentDate = dayjs(currentDate).add(1, "day").format('YYYY-MM-DD')
			}
		}
	}

	// if (action === actions.condenseTimeSheets) {
	if (action === actions.extractTimeSheets) {
		outputExt2 = addEmptyDays(outputExt)

		uniqueValuesList.push.apply(uniqueValuesList, filterUniqueValues(outputExt2))

		const count2 = setConversionCount(actions.condenseTimeSheets, retrievedListLength, filteredSortedList.length - 1)
		for (let i = count2.start; i <= count2.end; i++) {
			const outputArrayDataRow = []
			outputArrayDataRow.push.apply(outputArrayDataRow, setOutputArrayData(actions.condenseTimeSheets, row, rowIndex, i, currentDate, outputExt2, workPackageIDs, filteredSortedList, uniqueValuesList, clientTypesList, categoryTypesList, projectList, categoryList, workPackageList, timeEntryList, userList))
			if (outputArrayDataRow.length !== 0) {
				outputArrayDataRow.sort(compareAlphabetical)
				outputArrayDataRow.sort(compareMoveCurlyToBottom)
				outputArray.push({name: outputExt2[i].name, data: outputArrayDataRow})
			}
		}
	}

	// if (action === actions.tabulateSumTimeEntries) {
	if (action === actions.summarizeUtTimeEntries) {

		const count2 = setConversionCount(actions.tabulateUtTimeEntries, retrievedListLength, filteredSortedList.length - 1)
		for (let i = count2.start; i <= count2.end; i++) {
			const outputArrayDataRow = []
			outputArrayDataRow.push.apply(outputArrayDataRow, setOutputArrayData(actions.tabulateUtTimeEntries, row, rowIndex, i, currentDate, outputExt, workPackageIDs, filteredSortedList, uniqueValuesList, clientTypesList, categoryTypesList, projectList, categoryList, workPackageList, timeEntryList, userList))
			if (outputArrayDataRow.length !== 0) {
				outputArray.push({data: outputArrayDataRow[0]})
			}
		}
	}

	// if (action === actions.tabulateCatTimeEntries) {
	if (action === actions.summarizeCatTimeEntries) {

		const count2 = setConversionCount(actions.tabulateCatTimeEntries, retrievedListLength, filteredSortedList.length - 1)
		for (let i = count2.start; i <= count2.end; i++) {
			const outputArrayDataRow = []
			outputArrayDataRow.push.apply(outputArrayDataRow, setOutputArrayData(actions.tabulateCatTimeEntries, row, rowIndex, i, currentDate, outputExt, workPackageIDs, filteredSortedList, uniqueValuesList, clientTypesList, categoryTypesList, projectList, categoryList, workPackageList, timeEntryList, userList))
			if (outputArrayDataRow.length !== 0) {
				outputArray.push({data: outputArrayDataRow[0]})
			}
		}
	}

	const outputExt3 = []
	if (action === actions.breakdownClientByCatTimeEntries) {

		const count2 = setConversionCount(action, retrievedListLength, filteredSortedList.length - 1)
		for (let i = count2.start; i <= count2.end; i++) {
			const outputArrayDataRow = []
			const count3 = setConversionCount(action, retrievedListLength, filteredSortedList[i].data.length - 1)
			for (let j = count3.start; j <= count3.end; j++) {
				const outputArrayInnerDataRow = []
				outputArrayInnerDataRow.push.apply(outputArrayInnerDataRow, setOutputArrayData(action, row, rowIndex, j, currentDate, resultList, workPackageIDs, filteredSortedList[i].data, uniqueValuesList, clientTypes2List[i].data, categoryTypesList, projectList, categoryList, workPackageList, timeEntryList, userList))
				if (outputArrayInnerDataRow.length !== 0) {
					outputArrayDataRow.push({name: filteredSortedList[i].data[j].name, data: outputArrayInnerDataRow})
				}
			}
			if (outputArrayDataRow.length !== 0) {
				outputExt3.push({name: filteredSortedList[i].name, data: outputArrayDataRow})
			}
		}
	}


	// if (action === actions.tabulateBreakdownTimeEntries) {
	if (action === actions.breakdownClientByCatTimeEntries) {
		console.log("outputExt3", outputExt3)

		const count2 = setConversionCount(actions.tabulateBreakdownTimeEntries, retrievedListLength, filteredSortedList.length - 1)
		for (let i = count2.start; i <= count2.end; i++) {
			const outputArrayDataRow = []
			const count3 = setConversionCount(actions.tabulateBreakdownTimeEntries, retrievedListLength, filteredSortedList[i].data.length - 1)
			for (let j = count3.start; j <= count3.end; j++) {
				const outputArrayInnerDataRow = []
				outputArrayInnerDataRow.push.apply(outputArrayInnerDataRow, setOutputArrayData(actions.tabulateBreakdownTimeEntries, row, rowIndex, j, currentDate, outputExt3[i].data, workPackageIDs, filteredSortedList, uniqueValuesList, clientTypesList, categoryTypesList, projectList, categoryList, workPackageList, timeEntryList, userList))
				if (outputArrayInnerDataRow.length !== 0) {
					outputArrayDataRow.push({data: outputArrayInnerDataRow[0]})
				}
			}
			if (outputArrayDataRow.length !== 0) {
				outputArray.push({name: filteredSortedList[i].name, data: outputArrayDataRow})
			}
		}
	}

	// console.log("convert", {data: outputArray, errors: error})

	return {data: outputArray, errors: error}
}

function setConversionCount(action, retrievedListLength, filteredSortedListLength) {
	if (action === actions.convertToWorkPackageIDs
		|| action === actions.convertNamesToIDs
		|| action === actions.convertMembershipNamesToIDs
		|| action === actions.exportTimeEntries) {
		return {start: 0, end: 0}
	} else if (action === actions.convertWeekToDays) {
		return {start: 0, end: daysOfWeek.length - 1}
	} else if (action === actions.extractTimeSheets
		|| action === actions.condenseTimeSheets
		|| action === actions.summarizeUtTimeEntries
		|| action === actions.summarizeCatTimeEntries
		|| action === actions.breakdownClientByCatTimeEntries
		|| action === actions.tabulateUtTimeEntries
		|| action === actions.tabulateCatTimeEntries
		|| action === actions.tabulateBreakdownTimeEntries) {
		// same as uniqueValuesListLength
		// same as clientTypesListLength
		// same as categoryTypesListLength
		return {start: 0, end: filteredSortedListLength}
	} else if (action === actions.getProjects
		|| action === actions.getWorkPackages
		|| action === actions.getAllWorkPackages
		|| action === actions.getTimeEntries) {
		return {start: 0, end: retrievedListLength}
	} else {
		return {}
	}
}

function conversionErrorSelect(action, row, rowIndex, projectList, categoryList, workPackageIDs, filteredSortedList) {
	const outputArray = []
	let error = ""

	if (action === actions.convertToWorkPackageIDs) {
		if (!(workPackageIDs.length === 1)) {
			const projectName = findArrayNameFromID(projectList, row.client)
			const period = row.period
			error = `error: index ${rowIndex + 2}, number of matching workPackageIDs for this user: ${workPackageIDs.length}`
			if (workPackageIDs.length > 1) {
				for (let i = 0; i <= workPackageIDs.length - 1; i++) {
					error += `\r\n${workPackageIDs[i]} "${projectName}","${period}"`
				}
			} else {
				error += `\r\nfor "${projectName}","${period}"`
			}
			return {data: [{data: outputArray}], errors: error}
		}
		return false
	} else if (action === actions.convertNamesToIDs) {
		const projectName = row.client
		const projectIndex = findArrayIndexFromName(projectList, projectName)
		const categoryName = row.category
		const categoryIndex = findArrayIndexFromName(categoryList, categoryName)

		if (projectIndex === -1 || categoryIndex === -1) {
			if (projectIndex === -1) {
				error = `error: index ${rowIndex + 2} "${projectName}" not found`
			}
			if (categoryIndex === -1) {
				error = `error: index ${rowIndex + 2} "${categoryName}" not found`
			}
			outputArray.push({data: {
				client: projectName,
				period: row.period,
				category: categoryName,
				natureOfWork: row.natureOfWork,
				spentOn: row.spentOn,
				units: row.units
			}})
			return {data: outputArray, errors: error}
		}
		return false
	} else if (action === actions.convertMembershipNamesToIDs) {
		const projectName = row.client
		const projectIndex = findArrayIndexFromName(projectList, projectName)
		if (projectIndex === -1) {
			error = `error: index ${rowIndex + 2} "${projectName}" not found`
			outputArray.push({data: {
				project: projectName,
				user: row.user,
				role: row.role
			}})
			return {data: outputArray, errors: error}
		}
		return false
	} else if (action === actions.extractTimeSheets
		|| action === actions.summarizeUtTimeEntries
		|| action === actions.summarizeCatTimeEntries
		|| action === actions.breakdownClientByCatTimeEntries) {
		if (filteredSortedList.length === 0) {
			error = "error: No rows found for the selected weeks"
			return {errors: error}
		}
		return false
	} else if (action === actions.convertWeekToDays
		|| action === actions.exportTimeEntries
		|| action === actions.getProjects
		|| action === actions.getWorkPackages
		|| action === actions.getAllWorkPackages
		|| action === actions.getTimeEntries) {
		// || action === actions.condenseTimeSheets) {
		return false
	} else {
		return "Invalid action"
	}
}

function setOutputArrayData(action, row, rowIndex, i, currentDate, resultList, workPackageIDs, filteredSortedList, uniqueValuesList, clientTypesList, categoryTypesList, projectList, categoryList, workPackageList, timeEntryList, userList) {

	if (action === actions.convertToWorkPackageIDs) {
		return [{
			workPackageID: workPackageIDs[0],
			activity: row.category,
			comment: row.natureOfWork,
			spentOn: row.spentOn,
			units: row.units
		}]
	} else if (action === actions.convertNamesToIDs) {
		const projectName = row.client
		const projectIndex = findArrayIndexFromName(projectList, projectName)
		const projectID = projectList[projectIndex].id
		const categoryName = row.category
		const categoryIndex = findArrayIndexFromName(categoryList, categoryName)
		const categoryID = categoryList[categoryIndex].id
		return [{
			client: projectID,
			period: row.period,
			category: categoryID,
			natureOfWork: row.natureOfWork,
			spentOn: row.spentOn,
			units: row.units
		}]
	} else if (action === actions.convertMembershipNamesToIDs) {
		const projectName = row.client
		const projectIndex = findArrayIndexFromName(projectList, projectName)
		const projectID = projectList[projectIndex].id
		return [{
			project: projectID,
			user: row.user,
			role: row.role
		}]
	} else if (action === actions.convertWeekToDays) {
		// week: client,period,category,natureOfWork,mo,tu,wd,th,fr,sa,su
		// day:  client,period,category,natureOfWork,spentOn,units
		if (row[daysOfWeek[i]] !== "") {
			return [{
				client: row.client,
				period: row.period,
				category: row.category,
				natureOfWork: row.natureOfWork,
				spentOn: currentDate,
				units: row[daysOfWeek[i]]
			}]
		}
		return []
	} else if (action === actions.extractTimeSheets) {
		const filteredSortedListData = filteredSortedList[i].data
		const outputArrayDataRow = []
		for (let j = 0; j <= filteredSortedListData.length - 1; j++) {
			let innerDataRow
			let currentDate2 = currentDate
			for (let index = 0; index <= daysOfWeek.length - 1; index++) {
				if (filteredSortedListData[j].spentOn === currentDate2) {
					innerDataRow = {
						client: filteredSortedListData[j].client,
						period: filteredSortedListData[j].period,
						category: filteredSortedListData[j].category,
						natureOfWork: filteredSortedListData[j].natureOfWork,
						[daysOfWeek[index]]: filteredSortedListData[j].units
					}
				}
				currentDate2 = dayjs(currentDate2).add(1, "day").format('YYYY-MM-DD')
			}
			outputArrayDataRow.push(innerDataRow)
		}
		return outputArrayDataRow
	} else if (action === actions.condenseTimeSheets) {
		return summarizeData(action, resultList, uniqueValuesList, i, "")

	} else if (action === actions.summarizeUtTimeEntries
		|| action === actions.breakdownClientByCatTimeEntries) {
		return summarizeData(action, filteredSortedList, clientTypesList, i, "client")

	} else if (action === actions.summarizeCatTimeEntries) {
		return summarizeData(action, filteredSortedList, categoryTypesList, i, "category")

	} else if (action === actions.tabulateUtTimeEntries) {
		return tabulateData(action, resultList, i, "client", "user/client")

	} else if (action === actions.tabulateCatTimeEntries) {
		return tabulateData(action, resultList, i, "category", "grade/category")

	} else if (action === actions.tabulateBreakdownTimeEntries) {
		return tabulateData(action, resultList, i, "client", "grade/client")

	} else if (action === actions.getProjects
		|| action === actions.getWorkPackages
		|| action === actions.getAllWorkPackages
		|| action === actions.getTimeEntries) {
		const retrivedProjectList = resultList[rowIndex].data["_embedded"]["elements"]
		if (action === actions.getProjects) {
			return [{
				id: retrivedProjectList[i]["id"],
				identifier: retrivedProjectList[i]["identifier"],
				name: retrivedProjectList[i]["name"]
			}]
		} else if (action === actions.getWorkPackages
			|| action === actions.getAllWorkPackages) {
			return [{
				id: retrivedProjectList[i]["id"],
				subject: retrivedProjectList[i]["subject"],
				project: extractProject(retrivedProjectList[i]),
				assignee: extractAssignee(retrivedProjectList[i]),
				status: retrivedProjectList[i]["_links"]["status"]["title"]
			}]
		} else if (action === actions.getTimeEntries) {
			return [{
				id: retrivedProjectList[i]["id"],
				spentOn: retrivedProjectList[i]["spentOn"],
				hours: convertUnitsBack(retrivedProjectList[i]["hours"]),
				comment: retrivedProjectList[i]["comment"]["raw"],
				workPackage: extractWorkPackage(retrivedProjectList[i]),
				user: extractUser(retrivedProjectList[i]),
				activity: extractActivity(retrivedProjectList[i]),
				billingStatus: retrivedProjectList[i]["_links"][custom.billingStatus]["title"],
				feeNoteNumber: retrivedProjectList[i][custom.feeNoteNumber]
			}]
		}
	} else if (action === actions.exportTimeEntries) {
		const workPackageID = timeEntryList[rowIndex]["workPackage"]
		const workPackageIndex = findArrayIndexFromID(workPackageList, workPackageID)
		const projectID = workPackageList[workPackageIndex]["project"]
		const projectIndex = findArrayIndexFromID(projectList, projectID)
		const categoryID = timeEntryList[rowIndex]["activity"]
		const categoryIndex = findArrayIndexFromID(categoryList, categoryID)
		const userID = timeEntryList[rowIndex]["user"]
		const userIndex = findArrayIndexFromID(userList, userID)
		return [{
			id: timeEntryList[rowIndex]["id"],
			workPackage: workPackageID,
			spentOn: timeEntryList[rowIndex]["spentOn"],
			user: userList[userIndex]["name"],
			grade: userList[userIndex]["grade"],
			client: projectList[projectIndex]["name"],
			period: workPackageList[workPackageIndex]["subject"],
			category: categoryList[categoryIndex]["name"],
			status: workPackageList[workPackageIndex]["status"],
			natureOfWork: removeNatureNull(timeEntryList[rowIndex]["comment"]),
			units: removeUnitsNull(timeEntryList[rowIndex]["hours"]),
			billingStatus: timeEntryList[rowIndex]["billingStatus"],
			feeNoteNumber: removeFeeNoteNull(timeEntryList[rowIndex]["feeNoteNumber"])
			// cost: ,
		}]
	} else {
		return "Invalid action"
	}
}

function filterListToDateRange(resultList, weekBegin, dateEndPeriod) {
	const endDateObj = dayjs(dateEndPeriod)
	const weekBeginObj = dayjs(weekBegin)
	return filterList(resultList, weekBegin, endDateObj.diff(weekBeginObj, 'day'))
}

function filterListToNumberOfWeeks(resultList, weekBegin, numberOfWeeks) {
	return filterList(resultList, weekBegin, (daysOfWeek.length - 1) * numberOfWeeks)
}

function filterList(resultList, weekBegin, upperBound) {
	let currentDate = weekBegin
	const tempArray = []
	for (let index = 0; index <= upperBound; index++) {
		for (let index2 = 0; index2 <= resultList.length - 1; index2++) {
			if (resultList[index2].spentOn === currentDate) {
				tempArray.push(resultList[index2])
			}
		}
		currentDate = dayjs(currentDate).add(1, "day").format('YYYY-MM-DD')
	}
	return tempArray
}

function splitListByUser(resultList, userList) {
	const tempArray = []
	for (let index = 0; index <= userList.length - 1; index++) {
		const tempArrayData = innerLoopA(resultList, "user", userList, "name", index)
		if (tempArrayData.length !== 0) {
			tempArray.push({name: userList[index].name, data: tempArrayData})
		}
	}
	return tempArray
}

function innerLoopA(listA, propA, listB, propB, indexB) {
	const tempArray = []
	for (let indexA = 0; indexA <= listA.length - 1; indexA++) {
		if (listA[indexA][propA] === listB[indexB][propB]) {
			tempArray.push(listA[indexA])
		}
	}
	return tempArray
}

function splitListByGrade(resultList, userList) {
	const tempArray = []
	for (let index = 0; index <= userList.length - 1; index++) {
		// if userList[index].grade is not found in tempArray[all].name
		if (!(tempArray.some(function(e) {return e.name === userList[index].grade}))) {
			const tempArrayData = innerLoopA(resultList, "grade", userList, "grade", index)
			if (tempArrayData.length !== 0) {
				tempArray.push({name: userList[index].grade, data: tempArrayData})
			}
		}
	}
	return tempArray
}

function splitListByCategoryThenGrade(resultList, categoryList, userList) {
	const tempArray = []
	for (let index = 0; index <= categoryList.length - 1; index++) {
		// if categoryList[index].name is not found in tempArray[all].name
		if (!(tempArray.some(function(e) {return e.name === categoryList[index].name}))) {
			const tempArrayData = []
			for (let index2 = 0; index2 <= userList.length - 1; index2++) {
				// if userList[index2].grade is not found in tempArrayData[all].name
				if (!(tempArrayData.some(function(e) {return e.name === userList[index2].grade}))) {
					const tempArrayinnerData = []
					for (let index3 = 0; index3 <= resultList.length - 1; index3++) {
						if (resultList[index3].grade === userList[index2].grade
							&& resultList[index3].category === categoryList[index].name) {
							tempArrayinnerData.push(resultList[index3])
						}
					}
					if (tempArrayinnerData.length !== 0) {
						tempArrayData.push({name: userList[index2].grade, data: tempArrayinnerData})
					}
				}
			}
			if (tempArrayData.length !== 0) {
				tempArray.push({name: categoryList[index].name, data: tempArrayData})
			}
		}
	}
	return tempArray
}

function filterUniqueValues(resultList) {
	const tempArray = []
	for (let i = 0; i <= resultList.length - 1; i++) {
		const tempArrayData = []
		const resultListData = resultList[i].data
		tempArrayData.push({
			client: resultListData[0].client,
			period: resultListData[0].period,
			category: resultListData[0].category,
			natureOfWork: resultListData[0].natureOfWork
		})
		for (let j = 0 + 1; j <= resultListData.length - 1; j++) {
			// if ### is not ### in tempArrayData[all].###
			if (!(tempArrayData.some(function(e) {return (e.client === resultListData[j].client
				&& e.period === resultListData[j].period
				&& e.category === resultListData[j].category
				&& e.natureOfWork === resultListData[j].natureOfWork)}))) {
				tempArrayData.push({
					client: resultListData[j].client,
					period: resultListData[j].period,
					category: resultListData[j].category,
					natureOfWork: resultListData[j].natureOfWork
				})
			}
		}
		tempArray.push({name: resultList[i].name, data: tempArrayData})
	}
	return tempArray
}

function filterClientTypes(resultList, projectList) {
	const tempArrayData = []
	tempArrayData.push({client: "client"})
	for (let j = 0; j <= projectList.length - 1; j++) {
		if (projectList[j].name[0] === "}") {
			tempArrayData.push({client: projectList[j].name})
		}
	}
	const tempArray = []
	for (let i = 0; i <= resultList.length - 1; i++) {
		tempArray.push({name: resultList[i].name, data: tempArrayData.slice()})
	}
	return tempArray
}

function filterClientTypes2(resultList) {
	const tempArray = []
	for (let i = 0; i <= resultList.length - 1; i++) {
		const resultListData = resultList[i].data
		const tempArrayData = []
		for (let j = 0; j <= resultListData.length - 1; j++) {
			const resultListInnerData = resultListData[j].data
			const tempArrayInnerData = []
			for (let k = 0; k <= resultListInnerData.length - 1; k++) {
				// if resultListInnerData[k].client is not found in tempArray[all].client
				if (!(tempArrayInnerData.some(function(e) {return e.client === resultListInnerData[k].client}))) {
					tempArrayInnerData.push({client: resultListInnerData[k].client})
				}
			}
			tempArrayData.push({name: resultList[j].name, data: tempArrayInnerData.slice()})
		}
		tempArray.push({name: resultList[i].name, data: tempArrayData.slice()})
	}
	return tempArray
}

function filterCategoryTypes(resultList, categoryList) {
	const tempArrayData = []
	for (let j = 0; j <= categoryList.length - 1; j++) {
		tempArrayData.push({category: categoryList[j].name})
	}
	const tempArray = []
	for (let i = 0; i <= resultList.length - 1; i++) {
		tempArray.push({name: resultList[i].name, data: tempArrayData.slice()})
	}
	return tempArray
}

function filterTableTypes(resultList, prop) {
	const temp = [{[prop]: resultList[0].data[0][prop]}]
	for (let i = 0; i <= resultList.length - 1; i++) {
		for (let j = 0; j <= resultList[i].data.length - 1; j++) {
			// if resultList[i].data[j][prop] is found in temp[all][prop]
			if (!(temp.some(function(e) {return e[prop] === resultList[i].data[j][prop]}))) {
				temp.push({[prop]: resultList[i].data[j][prop]})
			}
		}
	}

	return temp
}

function summarizeData(action, listA, listB, i, prop) {

    const listDataA = listA[i].data
    const listDataB = listB[i].data

	// @ts-ignore
	// eslint-disable-next-line no-inner-declarations
	function reduceFunctionA(index) {
		return getReducedList(listDataB[index])
	}

	// @ts-ignore
    // eslint-disable-next-line no-inner-declarations
    function reduceFunctionB(index) {
        return getSummedList(listDataB[index], prop)
    }

    // @ts-ignore
    // eslint-disable-next-line no-inner-declarations
    function reduceFunctionC(index) {
        return getSummedList2(listDataB[index], prop)
    }

    // @ts-ignore
    // eslint-disable-next-line no-inner-declarations
	function reduceObjectFunctionA(index) {
		return {
			client: listDataB[index].client,
			period: listDataB[index].period,
			category: listDataB[index].category,
			natureOfWork: listDataB[index].natureOfWork,
			monday: "",
			tuesday: "",
			wednesday: "",
			thursday: "",
			friday: "",
			saturday: "",
			sunday: ""
		}
	}

    // @ts-ignore
    // eslint-disable-next-line no-inner-declarations
    function reduceObjectFunctionB(index) {
        return {[prop]: listDataB[index][prop], units: ""}
    }

	if (action === actions.condenseTimeSheets) {
		return summarizeDataInner(listDataA, listDataB, reduceFunctionA, reduceObjectFunctionA)
	} else if (action === actions.summarizeUtTimeEntries) {
		return summarizeDataInner(listDataA, listDataB, reduceFunctionB, reduceObjectFunctionB)
	} else if (action === actions.summarizeCatTimeEntries) {
		return summarizeDataInner(listDataA, listDataB, reduceFunctionC, reduceObjectFunctionB)
	} else if (action === actions.breakdownClientByCatTimeEntries) {
		return summarizeDataInner(listDataA, listDataB, reduceFunctionC, reduceObjectFunctionB)
	}
}

function summarizeDataInner(listDataA, listDataB, reduceFunctionArg, reduceObjectFunctionArg) {
	const outputArrayDataRow = []
	for (let j = 0; j <= listDataB.length - 1; j++) {
		const summedOrCondensedRow = listDataA.reduce(reduceFunctionArg(j), reduceObjectFunctionArg(j))
		outputArrayDataRow.push(summedOrCondensedRow)
	}
	return outputArrayDataRow
}

function tabulateData(action, resultList, i, prop, topLeft) {

	const resultListData = resultList[i].data
	const typesListData = filterTableTypes(resultList, prop)

	if (action === actions.tabulateUtTimeEntries
		|| action === actions.tabulateBreakdownTimeEntries) {
		typesListData.sort(compareAlphabetical)
		typesListData.sort(compareMoveCurlyToBottom)
	}

	const innerTableData = {[topLeft]: resultList[i].name}
	return tabulateDataInner(resultListData, typesListData, innerTableData, prop)
}

function tabulateDataInner(resultListData, typesListData, innerTableData, prop) {
	for (let j = 0; j <= typesListData.length - 1; j++) {
		// if clientTypesListData[j][prop] is found in resultListData[all][prop]
		if (resultListData.some(function(e) {return e[prop] === typesListData[j][prop]})) {
			const resultListIndex = resultListData.findIndex(function(e) {return e[prop] === typesListData[j][prop]})
			innerTableData[typesListData[j][prop]] = resultListData[resultListIndex].units
		} else {
			innerTableData[typesListData[j][prop]] = 0
		}
	}
	return [innerTableData]
}

function getReducedList(uniqueValuesListRow) {
	return function (accumulator, currentValue) {
		if (currentValue.client === uniqueValuesListRow.client
			&& currentValue.period === uniqueValuesListRow.period
			&& currentValue.category === uniqueValuesListRow.category
			&& currentValue.natureOfWork === uniqueValuesListRow.natureOfWork) {
			for (let index = 0; index <= daysOfWeek.length - 1; index++) {
				if (!(currentValue[daysOfWeek[index]] === "")) {
					accumulator[daysOfWeek[index]] = String(Number(accumulator[daysOfWeek[index]]) + Number(currentValue[daysOfWeek[index]]))
				}
			}
		}
		return accumulator
	}
}

function getSummedList(typesListRow, prop) {
	// clientTypesListRow, client
	return function (accumulator, currentValue) {
		if (typesListRow[prop] === "client") {
			const condition = (currentValue[prop][0] !== "}")
			return getSummedListInner(accumulator, currentValue, condition)
		}
		const condition = (currentValue[prop] === typesListRow[prop])
		return getSummedListInner(accumulator, currentValue, condition)
	}
}

function getSummedList2(typesListRow, prop) {
	return function (accumulator, currentValue) {
		const condition = (currentValue[prop] === typesListRow[prop])
		return getSummedListInner(accumulator, currentValue, condition)
	}
}

function getSummedListInner(accumulator, currentValue, condition) {
	if (condition) {
		accumulator["units"] = String(Number(accumulator["units"]) + Number(currentValue["units"]))
	}
	return accumulator
}

function compareAlphabetical(a, b) {
	let clientA = a.client
	let clientB = b.client

	if (clientA.localeCompare(clientB) < 0) {
		return -1
	}
	if (clientA.localeCompare(clientB) > 0) {
		return 1
	}
	return 0
}

function compareMoveCurlyToBottom(a, b) {
	let clientA = a.client
	let clientB = b.client

	if (clientA[0] === "}"
		&& clientB[0] !== "}") {
		return 1
	}
	if (clientA[0] !== "}"
		&& clientB[0] === "}") {
		return -1
	}
	return 0
}

// function findIndexOfValue(list, value) {
// 	return list.findIndex(function(item) {return item.name === value})
// }

function findArrayNameFromID(items, condition) {
	for (let i = 0; i <= items.length - 1; i++) {
		// == because numbers as strings
		if (items[i].id == condition) {
			return items[i].name
		}
	}
	return ""
}

function findArrayIDFromName(items, condition) {
	for (let i = 0; i <= items.length - 1; i++) {
		if (items[i].name === condition) {
			return items[i].id
		}
	}
	return ""
}

function findArrayIndexFromName(items, condition) {
	for (let i = 0; i <= items.length - 1; i++) {
		if (items[i].name === condition) {
			return i
		}
	}
	return -1
}

function findArrayIndexFromID(items, condition) {
	for (let i = 0; i <= items.length - 1; i++) {
		// == because numbers as strings
		if (items[i].id == condition) {
			return i
		}
	}
	return -1
}

function removeNatureNull(element) {
	return removeNull(element, "none")
}

function removeUnitsNull(element) {
	return removeNull(element, "null")
}

function removeFeeNoteNull(element) {
	return removeNull(element, "-")
}

function removeNull(element, value) {
	if (element !== null) {
		return element
	} else {
		return value
	}
}

function extractProject(element) {
	return extractElement(element, "project", "/projects/")
}

function extractAssignee(element) {
	return extractElement(element, "assignee", "/users/")
}

function extractWorkPackage(element) {
	return extractElement(element, "workPackage", "/work_packages/")
}

function extractUser(element) {
	return extractElement(element, "user", "/users/")
}

function extractActivity(element) {
	return extractElement(element, "activity", "/time_entries/activities/")
}

function extractElement(element, subElement, subURL) {
	if (element["_links"][subElement]["href"] !== null) {
		return Number(element["_links"][subElement]["href"].replace(`${apiURL}${subURL}`, ""))
	} else {
		return element["_links"][subElement]["href"]
	}
}

function setFullUrl(action, row) {

	if (action === actions.updateWorkPackage) {
		return `${baseURL}/work_packages/${row.workPackageID}`
	} else if (action === actions.updateTimeEntry) {
		return `${baseURL}/time_entries/${row.timeEntryID}`
		// } else if (action === actions.deleteTimeEntry) {
		// 	return `${baseURL}/time_entries/${row.timeEntryID}`
	} else if (action === actions.addMembership) {
		return `${baseURL}/memberships`
	} else if (action === actions.addProject
		|| action === actions.getProjects) {
		return `${baseURL}/projects`
	} else if (action === actions.addWorkPackage
		|| action === actions.getAllWorkPackages
		|| action === actions.getAllWorkPackages) {
		return `${baseURL}/work_packages`
	} else if (action === actions.addTimeEntry
		|| action === actions.getTimeEntries) {
		return `${baseURL}/time_entries`
	} else {
		return "Invalid action"
	}
}

function setBody(action, row, lockVersion, rowIndex, wpConvertUser, billingStatusList) {

	if (action === actions.updateWorkPackage) {
		const tempWP = {}
		tempWP["lockVersion"] = lockVersion
		if (checkIfPropertyExists(row, "subject")) {
			tempWP["subject"] = row.subject
		}
		if (checkIfPropertyExists(row, "user")) {
			if (row.user === "nobody") {
				tempWP["_links"] = tempWP["_links"] ?? {}
				tempWP["_links"]["assignee"] = {
					"href": null
				}
			} else {
				tempWP["_links"] = tempWP["_links"] ?? {}
				tempWP["_links"]["assignee"] = {
					"href": `${apiURL}/users/${row.user}`
				}
			}
		}
		if (checkIfPropertyExists(row, "project")) {
			tempWP["_links"] = tempWP["_links"] ?? {}
			tempWP["_links"]["project"] = {
				"href": `${apiURL}/projects/${row.project}`
			}
		}
		if (checkIfPropertyExists(row, "status")) {
			tempWP["_links"] = tempWP["_links"] ?? {}
			tempWP["_links"]["status"] = {
				"href": `${apiURL}/statuses/${row.status}`
			}
		}
		return tempWP
	} else if (action === actions.updateTimeEntry) {
		const tempTimeEntry = {}
		if (checkIfPropertyExists(row, "spentOn")) {
			tempTimeEntry["spentOn"] = row.spentOn
		}
		if (checkIfPropertyExists(row, "units")) {
			const convertedUnits = convertUnits(row.units)
			tempTimeEntry["hours"] = convertedUnits
		}
		if (checkIfPropertyExists(row, "comment")) {
			tempTimeEntry["comment"] = {
				"raw": row.comment
			}
		}
		if (checkIfPropertyExists(row, "workPackageID")) {
			tempTimeEntry["_links"] = tempTimeEntry["_links"] ?? {}
			tempTimeEntry["_links"]["workPackage"] = {
				"href": `${apiURL}/work_packages/${row.workPackageID}`
			}
		}
		if (checkIfPropertyExists(row, "activity")) {
			tempTimeEntry["_links"] = tempTimeEntry["_links"] ?? {}
			tempTimeEntry["_links"]["activity"] = {
				"href": `${apiURL}/time_entries/activities/${row.activity}`
			}
		}
		if (checkIfPropertyExists(row, "billingStatus")) {
			tempTimeEntry["_links"] = tempTimeEntry["_links"] ?? {}
			tempTimeEntry["_links"][custom.billingStatus] = {
				"href": `${apiURL}/custom_options/${findArrayIDFromName(billingStatusList, row.billingStatus)}`
			}
		}
		if (checkIfPropertyExists(row, "feeNoteNumber")) {
			tempTimeEntry[custom.feeNoteNumber] = row.feeNoteNumber
		}
		return tempTimeEntry
	} else if (action === actions.addMembership) {
		return {
			"project": {
				"href": `${apiURL}/projects/${row.project}`
			},
			"principal": {
				"href": `${apiURL}/users/${row.user}`
			},
			"roles": [
				{
					"href": `${apiURL}/roles/${row.role}`
				}
			]
		}
	} else if (action === actions.addWorkPackage) {
		return {
			"subject": row.subject,
			"assignee": {
				"href": `${apiURL}/users/${row.user}`
			},
			"_links": {
				"project": {
					"href": `${apiURL}/projects/${row.project}`
				}
			}
		}
	} else if (action === actions.addProject) {
		return {
			"identifier": row.identifier,
			"name": row.name
		}
	} else if (action === actions.addTimeEntry) {
		const convertedUnits = convertUnits(row.units)
		return {
			"spentOn": row.spentOn,
			"hours": convertedUnits,
			"comment": {
				"raw": row.comment
			},
			"_links": {
				"workPackage": {
					"href": `${apiURL}/work_packages/${row.workPackageID}`
				},
				"activity": {
					"href": `${apiURL}/time_entries/activities/${row.activity}`
				}
			}
		}
	} else if (action === actions.getProjects) {
		return {
			filters: "[]"
		}
	} else if (action === actions.getWorkPackages) {
		// FIXME: pageSize is hardcoded as 100
		return {
			offset: rowIndex,
			pageSize: 100,
			filters: `[{"assignee":{"operator":"=","values":["${wpConvertUser}"]}}]`
		}
	} else if (action === actions.getAllWorkPackages) {
		// FIXME: pageSize is hardcoded as 100
		return {
			offset: rowIndex,
			pageSize: 100,
			filters: "[]"
		}
	} else if (action === actions.getTimeEntries) {
		// FIXME: pageSize is hardcoded as 100
		return {
			offset: rowIndex,
			pageSize: 100,
			filters: "[]"
		}
	} else {
		return "Invalid action"
	}
}

function convertUnits(units) {
	let convertedUnits = "P"
	const quotient = Math.floor(units / 24)
	const remainder = units % 24

	if (quotient !== 0) {
		convertedUnits += `${quotient}D`
	}
	if (remainder !== 0) {
		convertedUnits += `T${remainder}H`
	}
	return convertedUnits
}

function convertUnitsBack(convertedUnits) {
	let num1 = 0
	let num2 = 0
	if (convertedUnits.includes("D")) {
		num1 = Number(convertedUnits.substring(convertedUnits.lastIndexOf("P") + 1, convertedUnits.lastIndexOf("D")))
	}
	if (convertedUnits.includes("T")) {
		num2 = Number(convertedUnits.substring(convertedUnits.lastIndexOf("T") + 1, convertedUnits.lastIndexOf("H")))
	}

	return (num1 * 24) + num2
}

async function getCurrentListPartAAsync(action, rowIndex, wpConvertUser, httpMethod, apiKey, prefixName, prefixValue) {
	const fullURL = setFullUrl(action, "")
	const body = setBody(action, "", "", rowIndex, wpConvertUser, "")

	const reqResponse = await currentRequestAsync(fullURL, httpMethod, apiKey, body, prefixName, prefixValue)
	return reqResponse
}

async function doCurrentActionAsync(action, row, billingStatusList, httpMethod, withGet, apiKey, prefixName, prefixValue) {
	const fullURL = setFullUrl(action, row)

	if (withGet === true) {

		const getReqResponse = await currentRequestAsync(fullURL, "GET", apiKey, "", prefixName, prefixValue)

		if (typeof getReqResponse.error !== "undefined") {
			return getReqResponse
		}

		const lockVersion = getReqResponse.data["lockVersion"]

		getReqResponse.prelog.push(`lockVersion ${lockVersion}`)

		const body = setBody(action, row, lockVersion, "", "", "")

		const reqResponse = await currentRequestAsync(fullURL, httpMethod, apiKey, body, prefixName, prefixValue)

		reqResponse.prelog.unshift(...getReqResponse.prelog)

		return reqResponse
	} else {
		const body = setBody(action, row, "", "", "", billingStatusList)

		const reqResponse = await currentRequestAsync(fullURL, httpMethod, apiKey, body, prefixName, prefixValue)
		return reqResponse
	}
}

async function currentRequestAsync(fullURL, httpMethod, apiKey, body, prefixName, prefixValue) {

	const reqResponse = await WRequestAsync(fullURL, httpMethod, apiKey, body)

	if (typeof reqResponse.data === "undefined"
		&& typeof reqResponse.errorType !== "undefined") {
		return {prefix: `${prefixName} ${prefixValue}: ${httpMethod}`, prelog: ["request started"], status: reqResponse.status, errorType: reqResponse.errorType, error: reqResponse.error}
	}

	return {prefix: `${prefixName} ${prefixValue}: ${httpMethod}`, prelog: ["request started"], status: reqResponse.status, data: reqResponse.data}
}

async function WRequestAsync(fullURL, httpMethod, apiKey, bodyData) {
	const responseData = {}

	try {
		const options = {
			type: httpMethod,
			username: "apikey",
			password: apiKey,
			headers: {
				Authorization: `Basic ${btoa(`apikey:${apiKey}`)}`
			},
			contentType: 'application/json'
		}
		if (httpMethod === "GET") {
			options.data = $.param(bodyData, false)
		} else {
			options.data = JSON.stringify(bodyData)
		}

		// Note: NOT const response = await $.ajax(fullURL, options)
		const response = $.ajax(fullURL, options)
		await response

		responseData.data = response.responseJSON
		responseData.status = `${response.status} ${response.statusText}`

	} catch (error) {
		if (error.readyState === 4) {
			// HTTP error
			if (typeof error.responseJSON !== "undefined") {
				// OpenProject error
				responseData.errorType = webErrorTypes.httpWithJSON
				responseData.error = error.responseJSON
			} else {
				responseData.errorType = webErrorTypes.http
			}
			responseData.status = `${error.status} ${error.statusText}`
		}
		else if (error.readyState === 0) {
			// Network error (i.e. timeout, connection refused, access denied due to CORS, etc.)
			responseData.errorType = webErrorTypes.network
			responseData.error = "Network error"
			// FIXME: Remove this from here
			responseData.status = "request failed"
		}
		else {
			// something weird is happening
			responseData.errorType = webErrorTypes.unknown
			responseData.error = "Unknown error with web request"
			// FIXME: Remove this from here
			responseData.status = "request failed"
		}
	}
	return responseData
}

export { actions, webErrorTypes, doActionAsync, webErrorsPresent }