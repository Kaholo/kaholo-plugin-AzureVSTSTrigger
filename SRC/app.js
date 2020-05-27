const config = require("./config");
const mapExecutionService = require("../../../api/services/map-execution.service");
const Trigger = require("../../../api/models/map-trigger.model");
const minimatch = require("minimatch")

module.exports = {
    prWebhook: controllerfunctionPR,
    pushWebhook: controllerfunctionPush
}

function findTriggers(body, validatationFn, startParams, req, res){
    Trigger.find({ plugin: config.name }).then((triggers) => {
        console.log(`Found ${triggers.length} triggers`);
        res.send('OK');
        triggers.forEach(trigger=>{  
            validatationFn(trigger,startParams)
            .then(exec(trigger, body, req.io))
            .catch(console.error);
        });
    }).catch((error) => res.send(error))
}

function exec(trigger, body, io){
    return ()=>{
        console.log(trigger.map);
        let message = trigger.name + ' - Started by Azure Git trigger';
        /*if (body.sender && body.sender.login) {
            message += ` (body by ${body.sender.login}`
        }*/
        console.log(`******** Azure Git: executing map ${trigger.map} ********`);
        mapExecutionService.execute(trigger.map, null, io, {config : trigger.configuration}, message, body);
    }
}

function controllerfunctionPR (req, res) {
    let body = req.body;
    
    if(!body.resource.repository) {
        console.log('Repo not found')
        return res.send('repo not found')
    }
    
    let repositoryURL = body.resource.repository.remoteUrl
    let targetBranch = body.resource.targetRefName.slice(11); //Get target branch name
    let sourceBranch = body.resource.sourceRefName.slice(11); //Get source branch name
    
    findTriggers(body, validateTriggerPR, {repositoryURL, targetBranch, sourceBranch},req, res);
}

function controllerfunctionPush(req,res){
    let push = req.body;
    
    if(!push.resource.repository) {
        console.log('Repo not found')
        return res.send('repo not found')
    }
    
    let repositoryURL = push.resource.repository.remoteUrl
    let pushBranch = push.resource.refUpdates[push.resource.refUpdates.length - 1].name.slice(11); //Get target branch name
    
    findTriggers(push, validateTriggerPush, {repositoryURL, pushBranch},req, res);
}

function validateTriggerPR(trigger, {repositoryURL, targetBranch, sourceBranch}){
    return new Promise((resolve, reject) => {
        
        const triggerRepoUrl = trigger.params.find(o => o.name === 'REPO_URL');
        const toBranch = trigger.params.find(o => o.name === 'TO_BRANCH');
        const fromBranch = trigger.params.find(o => o.name === 'FROM_BRANCH');
        
        /**
         * Check if the Repo URL is provided (else consider as ANY)
         * Check that the Repo URL is the same as provided by the Trigger and if not provided 
        */
        if (triggerRepoUrl.value && repositoryURL !== triggerRepoUrl.value) {
            return reject("Not same repo");
        }

        /**
         * Check that To branch provided - else - consider as any.
         */
        if (toBranch.value && !minimatch(targetBranch, toBranch.value)) {
                return reject("Not matching target branch")
        }

        /**
         * Check that From branch provided - else - consider as any.
         */
        if (fromBranch.value && !minimatch(sourceBranch, fromBranch.value)) {
            return reject("Not matching target branch")
        }

        return resolve();
    })
}

function validateTriggerPush(trigger, {repositoryURL, pushBranch}){
    return new Promise((resolve, reject) => {
        const triggerRepoUrl = trigger.params.find(o => o.name === 'REPO_URL');
        const triggerPushBranch = trigger.params.find(o => o.name === 'PUSH_BRANCH');

        /**
         * Check if the Repo URL is provided (else consider as ANY)
         * Check that the Repo URL is the same as provided by the Trigger and if not provided 
        */
        if (triggerRepoUrl.value && repositoryURL !== triggerRepoUrl.value) {
            return reject("Not same repo");
        }

        /**
         * Check that To branch provided - else - consider as any.
         */
        if (triggerPushBranch.value && !minimatch(pushBranch, triggerPushBranch.value)) {
                return reject("Not matching pushed branch")
        }

        return resolve();
    });
}

