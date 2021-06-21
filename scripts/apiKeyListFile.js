function passwordToApiKey(user, password){
    const apiKeyList = [{"user": "5", "name": "admin", "password": "", "apikey": ""},
    {"user": "4", "name": "Alice", "password": "1234", "apikey": "1234567890123456789012345678901234567890123456789012345678901234"},
    {"user": "5", "name": "Bob", "password": "1234", "apikey": "1234567890123456789012345678901234567890123456789012345678901234"},
    {"user": "6", "name": "Carrol", "password": "1234", "apikey": "1234567890123456789012345678901234567890123456789012345678901234"}]

    for (let i = 0; i <= apiKeyList.length - 1; i++) {
        if ((user === apiKeyList[i].user) && (password === apiKeyList[i].password)) {
            return apiKeyList[i].apikey
        }
    }
    return ""
}

export { passwordToApiKey }