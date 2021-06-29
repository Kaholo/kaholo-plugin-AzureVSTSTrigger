const minimatch = require("minimatch")

function prWebhook (req, res, settings, triggerControllers) {
    try { 
        const body = req.body;
        let {repository, targetRefName, sourceRefName} = body.resource;
        if(!repository){
            return res.status(400).send("Repo not found");
        }
        targetRefName = targetRefName.slice(11); sourceRefName = sourceRefName.slice(11);
        triggerControllers.forEach(trigger => {
            const {REPO_URL: repoUrl, TO_BRANCH: toBranch, FROM_BRANCH: fromBranch} = trigger.params;
            if (toBranch && !minimatch(targetRefName, toBranch)) return;
            if (fromBranch && !minimatch(sourceRefName, fromBranch)) return;
            if (repoUrl && repository.remoteUrl !== repoUrl) return;
            const msg = `${sourceRefName}->${targetRefName} Pull Request`;
            trigger.execute(msg, body);
        });
        res.status(200).send("OK");
    }
    catch (err){
        res.status(422).send(err.message);
    }
}

function pushWebhook (req, res, settings, triggerControllers) {
    try { 
        const body = req.body;
        const repository = body.resource.repository;
        const reqBranch = body.resource.refUpdates[body.resource.refUpdates.length - 1].name.slice(11); // Get target branch name
        if(!repository){
            return res.status(400).send("Repo not found");
        }
        triggerControllers.forEach(trigger => {
            const {REPO_URL: repoUrl, PUSH_BRANCH: branch} = trigger.params;
            if (branch && !minimatch(reqBranch, branch)) return;
            if (repoUrl && repository.remoteUrl !== repoUrl) return;
            const msg = `${reqBranch} Branch Push`;
            trigger.execute(msg, body);
        });
        res.status(200).send("OK");
    }
    catch (err){
        res.status(422).send(err.message);
    }
}

module.exports = {
    prWebhook,
    pushWebhook
}