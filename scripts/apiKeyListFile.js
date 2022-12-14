const apiKeyList = [{ "user": "4", "name": "admin", "password": "", "apikey": "" },
{ "user": "6", "name": "Alice", "password": "1234", "apikey": "1234567890123456789012345678901234567890123456789012345678901234" },
{ "user": "7", "name": "Bob", "password": "1234", "apikey": "1234567890123456789012345678901234567890123456789012345678901234" },
{ "user": "8", "name": "Carrol", "password": "1234", "apikey": "1234567890123456789012345678901234567890123456789012345678901234" }]

function passwordToApiKey(user, password) {

    for (let i = 0; i <= apiKeyList.length - 1; i++) {
        if ((user === apiKeyList[i].user)
            && (password === apiKeyList[i].password)) {
            return apiKeyList[i].apikey
        }
    }
    return ""
}

function passwordAndApiKeyMatch(user, apiKey) {

    for (let i = 0; i <= apiKeyList.length - 1; i++) {
        if ((user === apiKeyList[i].user)
            && (apiKey === apiKeyList[i].apikey)) {
            return true
        }
    }
    return false
}

export { passwordToApiKey, passwordAndApiKeyMatch }