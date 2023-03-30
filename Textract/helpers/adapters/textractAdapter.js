const Textract = require('aws-sdk').Textract;
const isArray = require('lodash').isArray;
const textract = new Textract({ apiVersion: '2018-06-27' });



module.exports = function TextractAdapter() {
    let getDocumentAnalysis = (params) => {
        return new Promise((resolve, reject) => {
            textract.getDocumentAnalysis(params, (err, data) => {
                if (err) reject(err)
                else resolve(data)
            })
        })
    }

    let check = (JobId, MaxResults, NextToken) => {
        return new Promise(async (resolve, reject) => {
            let chunk
            let data = []
            do {
                try {
                    chunk = await getDocumentAnalysis(NextToken ? { JobId, MaxResults, NextToken } : { JobId, MaxResults })

                    if (chunk.JobStatus === 'FAILED') {
                        throw new Error('Analysis has failed.')
                    } else if (chunk.JobStatus === 'PARTIAL_SUCCESS') {
                        throw new Error('Analysis has partially succeeded.')
                    } else if (chunk.JobStatus === 'IN_PROGRESS') {
                        resolve(chunk.JobStatus)
                    }

                    data = data.concat(chunk.Blocks)
                    NextToken = chunk.NextToken

                } catch (err) {
                    reject(err)
                }
                
                
            } while (NextToken)
            resolve(data)
        })
    }

    let analyze = (bucketName, fileName, featureTypes) => {
        return new Promise((resolve, reject) => {
            let params = {
                DocumentLocation: {
                    S3Object: {
                        Bucket: bucketName,
                        Name: fileName
                    }
                },
                FeatureTypes: featureTypes,
            }

            textract.startDocumentAnalysis(params,
                function (err, JobId) {
                    if (err) reject(err) // an error occurred
                    else resolve(JobId)          // successful response
                })
        })
    }
    // This code is better but can be improved
    let waitAndGetAnalysis = (jobId) => {
        const WAITING_TIME = 10000
        const MAX_RESULTS = 1000
        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                check(jobId, MAX_RESULTS, '')
                    .then(data => {
                        if (isArray(data)) {
                            clearInterval(interval)
                            resolve(data)
                        } else {
                            console.log('Job Status:', data)
                        } 
                    })
                    .catch(err => {
                        clearInterval(interval)
                        reject(err)
                    })
            }, WAITING_TIME)
        })
    }

    return {
        analyze,
        waitAndGetAnalysis
    }
}

