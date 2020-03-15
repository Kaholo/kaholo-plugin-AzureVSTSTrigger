const config = require("./config");
const mapExecutionService = require("../../../api/services/map-execution.service");
const Trigger = require("../../../api/models/map-trigger.model");
module.exports = {
    prWebhook: function (req, res) {
        controllerfunctionPR(req,res)
    },
    pushWebhook: function(req, res){
        controllerfunctionPush(req,res)
    }
}

function controllerfunctionPR (req, res) {
    let push = req.body;
    
    if(!push.resource.repository) {
        console.log('Repo not found')
        return res.send('repo not found')
    }
    
    let repositoryURL = push.resource.repository.remoteUrl
    let targetBranch = push.resource.targetRefName.slice(11); //Get target branch name
    let sourceBranch = push.resource.sourceRefName.slice(11); //Get source branch name
    let requestBy = push.resource.createdBy.displayName;
    let reviewer = push.resource.reviewers[push.resource.reviewers.length - 1].displayName;
    Trigger.find({ plugin: config.name }).then((triggers) => {
        console.log(`Found ${triggers.length} triggers`);
        res.send('OK');
        triggers.forEach(trigger=>{  
            execTriggerPR(trigger,{push, repositoryURL, targetBranch, sourceBranch, requestBy, reviewer},req.io);
        });
    }).catch((error) => res.send(error))
}

function controllerfunctionPush(req,res){
    let push = req.body;
    
    if(!push.resource.repository) {
        console.log('Repo not found')
        return res.send('repo not found')
    }
    
    let repositoryURL = push.resource.repository.remoteUrl
    let pushBranch = push.resource.refUpdates[push.resource.refUpdates.length - 1].name.slice(11); //Get target branch name
    let pushedBy = push.resource.pushedBy.displayName;
    Trigger.find({ plugin: config.name }).then((triggers) => {
        console.log(`Found ${triggers.length} triggers`);
        res.send('OK');
        triggers.forEach(trigger=>{  
            execTriggerPush(trigger,{push, repositoryURL, pushBranch, pushedBy},req.io);
        });
    }).catch((error) => res.send(error))
}

function execTriggerPR(trigger, {push, repositoryURL, targetBranch, sourceBranch, requestBy, reviewer}, io){
    new Promise((resolve, reject) => {
        
        //const triggerSecret = trigger.params.find(o => o.name === 'SECRET');
        const triggerRepoUrl = trigger.params.find(o => o.name === 'REPO_URL');
        const toBranch = trigger.params.find(o => o.name === 'TO_BRANCH');
        const fromBranch = trigger.params.find(o => o.name === 'FROM_BRANCH');
        const requestedBy = trigger.params.find(o => o.name === 'REQUESTED_BY');
        const reviewerName = trigger.params.find(o => o.name === 'REVIEWER_NAME');
        /**
         * Check if the Repo URL is provided (else consider as ANY)
         * Check that the Repo URL is the same as provided by the Trigger and if not provided 
        */
        if (triggerRepoUrl.value && repositoryURL !== triggerRepoUrl.value) {
            console.log(url, triggerRepoUrl.value);
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

        /**
         * Check that Requested by provided - else - consider as any.
         */
        if (requestedBy.value && requestBy !== requestedBy.value) {
            console.log(requestBy, requestedBy.value);
            return reject("Not same Request By");
        }

        /**
         * Check that Reviewer by provided - else - consider as any.
         */
        if (reviewerName.value && reviewer !== reviewerName.value) {
            console.log(reviewer, reviewerName.value);
            return reject("Not same Reviewer");
        }
        
        else {
            return resolve();
        }

    }).then(() => {
        console.log(trigger.map);
        let message = trigger.name + ' - Started by Azure Git trigger';
        /*if (push.sender && push.sender.login) {
            message += ` (push by ${push.sender.login}`
        }*/
        console.log(`******** Azure Git: executing map ${trigger.map} ********`);
        mapExecutionService.execute(trigger.map, null, io, {config : trigger.configuration}, message, push);
    }).catch(err=>{
        console.error(err);
    })
}

function execTriggerPush(trigger, {push, repositoryURL, pushBranch, pushedBy}, io){
    new Promise((resolve, reject) => {
        //const triggerSecret = trigger.params.find(o => o.name === 'SECRET');
        const triggerRepoUrl = trigger.params.find(o => o.name === 'REPO_URL');
        const triggerPushBranch = trigger.params.find(o => o.name === 'PUSH_BRANCH');
        const triggerPushedBy = trigger.params.find(o => o.name === 'PUSHED_BY');
        /**
         * Check if the Repo URL is provided (else consider as ANY)
         * Check that the Repo URL is the same as provided by the Trigger and if not provided 
        */
        if (triggerRepoUrl.value && repositoryURL !== triggerRepoUrl.value) {
            console.log(url, triggerRepoUrl.value);
            return reject("Not same repo");
        }

        /**
         * Check that To branch provided - else - consider as any.
         */
        if (triggerPushBranch.value && !minimatch(pushBranch, triggerPushBranch.value)) {
                return reject("Not matching pushed branch")
        }

        /**
         * Check that From branch provided - else - consider as any.
         */
        if (triggerPushedBy.value && pushedBy !== triggerPushedBy.value) {
            return reject("Not matching target branch")
        }

        else {
            return resolve();
        }

    }).then(() => {
        console.log(trigger.map);
        let message = trigger.name + ' - Started by Azure Git trigger';
        /*if (push.sender && push.sender.login) {
            message += ` (push by ${push.sender.login}`
        }*/
        console.log(`******** Azure Git: executing map ${trigger.map} ********`);
        mapExecutionService.execute(trigger.map, null, io, {config : trigger.configuration}, message, push);
    }).catch(err=>{
        console.error(err);
    })
}