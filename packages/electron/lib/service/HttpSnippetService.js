
const path = require('path');
const fs = require("fs")
const constants = require('../constants/constants')
const WriteFile = require("../../writeFile")
const { v4: uuidv4 } = require("uuid");
const httpsnippet = require('httpsnippet').HTTPSnippet
const { signRequest } = require('../utils/awsV4Auth')

// GetHttpSnippet - function to Add Global Variables
const GetHttpSnippet = async (request) => {
    const { harRequest, target, client, options, auth } = request;

    try {
        if (auth.authType === 'awsV4') {
            let awsV4Req = auth.awsV4
            let hed = signRequest({
                url: harRequest.url,
                method: harRequest.method,
                data: null,
                service: awsV4Req.service,
                region: awsV4Req.region,
                accessKeyId: awsV4Req.accessKey,
                secretAccessKey: awsV4Req.secretKey,
                sessionToken: awsV4Req.sessionToken,
                contentType: 'application/json'
            })
            for (const [key, value] of Object.entries(hed.headers)) {
                harRequest.headers.push({
                    name: key,
                    value: value
                })
            }
        }
    } catch (error) {
        console.log("error in parsing awsV4 auth", error)
    }

    let code = ''
    try {

        var snippet = new httpsnippet({
            ...harRequest,
            method: harRequest.method,
            url: harRequest.url,
        });
        code = snippet.convert(target ? target : 'go', client, options);
    } catch (error) {
        return 'error while generating code snippet';
    }
    return code;
}


module.exports = {
    GetHttpSnippet,
};